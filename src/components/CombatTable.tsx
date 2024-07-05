import { useEffect, useState } from "react";
import {
  getFriendlyIntString,
  getFriendlyIntStringRate,
} from "../helpers/Formatting";
import { ItemDetail, OpenableLootDropMap } from "../models/Client";
import { MarketValue } from "../models/Market";
import { ApiData } from "../services/ApiService";
import { Flex, NumberInput, Switch, Table } from "@mantine/core";
import Icon from "./Icon";

type Enemies = {
  combatMonsterHrid: string;
  rate: number;
}[];

type OpenableLootDropData = {
  itemHrid: string;
  itemName: string;
  dropsPerChest: number;
  coinPerItem: number;
  coinPerChest: number;
  totalCoins: number;
  itemAsk: number;
  itemBid: number;
};

type LootData = {
  itemHrid: string;
  itemName: string;
  dropsPerHour: number;
  coinPerItem: number;
  coinPerHour: number;
  itemAsk: number;
  itemBid: number;
};

interface Props {
  data: ApiData;
  action: string;
  kph: number;
  withLuckyCoffee: boolean;
  combatBuffLevel: number;
  partyAmount: number;
  dungeon: boolean;
}

export default function CombatTable({
  action,
  data,
  kph,
  withLuckyCoffee,
  combatBuffLevel,
  partyAmount,
  dungeon,
}: Props) {
  const [priceOverrides, setPriceOverrides] = useState<{
    [key: string]: number | "";
  }>({});
  const [fromRaw, setFromRaw] = useState(false);

  const getRandomEncounter = () => {
    const spawns =
      data.actionDetails[action].combatZoneInfo!.fightInfo.randomSpawnInfo
        .spawns ?? [];
    const totalWeight = spawns.reduce((prev, cur) => prev + cur.rate, 0);

    const encounterHrids = [];
    let totalStrength = 0;

    outer: for (
      let i = 0;
      i <
      data.actionDetails[action].combatZoneInfo!.fightInfo.randomSpawnInfo
        .maxSpawnCount;
      i++
    ) {
      const randomWeight = totalWeight * Math.random();
      let cumulativeWeight = 0;

      for (const spawn of spawns) {
        cumulativeWeight += spawn.rate;
        if (randomWeight <= cumulativeWeight) {
          totalStrength += spawn.strength;

          if (
            totalStrength <=
            data.actionDetails[action].combatZoneInfo!.fightInfo.randomSpawnInfo
              .maxTotalStrength
          ) {
            encounterHrids.push(spawn.combatMonsterHrid);
          } else {
            break outer;
          }
          break;
        }
      }
    }
    return encounterHrids;
  };
  const getMultipleEncounters = (kph: number): string[][] => {
    const encounterList = [];
    const bossName: string[] = [];
    if (
      data.actionDetails[action].combatZoneInfo!.fightInfo.bossSpawns !== null
    ) {
      bossName.push(
        data.actionDetails[action].combatZoneInfo!.fightInfo.bossSpawns![0]
          .combatMonsterHrid
      );
    }

    for (let i = 1; i < kph + 1; i++) {
      if (
        i % 10 === 0 &&
        i !== 0 &&
        data.actionDetails[action].combatZoneInfo!.fightInfo.bossSpawns !== null
      ) {
        encounterList.push(bossName ?? getRandomEncounter());
      } else encounterList.push(getRandomEncounter());
    }
    return encounterList;
  };
  const getTotalKillsPerMonster = (encounterList: string[][]) => {
    const count = encounterList
      .flat()
      .reduce((acc: { [name: string]: number }, value: string) => {
        acc[value] = ++acc[value] || 1;
        return acc;
      }, {});
    return count;
  };
  const getEncounterRate = (
    totalKillsPerMonster: { [name: string]: number },
    kph: number
  ) => {
    const planetSpawnRate: Enemies = [];
    const monsterNames = Object.keys(totalKillsPerMonster);
    monsterNames.map((x) => {
      const monster = data.combatMonsterDetails[x];

      monsterNames.forEach((monsterName) => {
        if (monster.hrid === monsterName) {
          if (
            data.actionDetails[action].combatZoneInfo!.fightInfo.bossSpawns !==
              null &&
            data.actionDetails[action].combatZoneInfo!.fightInfo.bossSpawns![0]
              .combatMonsterHrid === monsterName &&
            kph % 10 !== 0
          ) {
            planetSpawnRate.push({
              combatMonsterHrid: monster.hrid,
              rate:
                (((kph / 10) % 1) + totalKillsPerMonster[monsterName]) / kph,
            });
          } else
            planetSpawnRate.push({
              combatMonsterHrid: monster.hrid,
              rate: totalKillsPerMonster[monsterName] / kph,
            });
        }
      });
    });
    return planetSpawnRate;
  };
  const [enemies, setEnemies] = useState<Enemies>(
    getEncounterRate(
      getTotalKillsPerMonster(getMultipleEncounters(kph)),
      kph
    ) as Enemies
  ); // so it doesn't get new rates everytime you change day/hr
  useEffect(() => {
    setEnemies(
      getEncounterRate(
        getTotalKillsPerMonster(getMultipleEncounters(kph)),
        kph
      ) as Enemies
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kph, action]); // only change when there's kph change

  const encounterRows = enemies.map((x) => {
    const monster = data.combatMonsterDetails[x.combatMonsterHrid];
    return (
      <tr key={action + "/encounterRate/" + x.combatMonsterHrid}>
        <td>
          <Flex
            justify="flex-start"
            align="center"
            direction="row"
            wrap="wrap"
            gap="xs"
          >
            <Icon hrid={x.combatMonsterHrid} /> {monster.name}
          </Flex>
        </td>
        <td>{getFriendlyIntString(x.rate, 3)}</td>
      </tr>
    );
  });
  const isDungeonToken = (item: MarketValue & ItemDetail): boolean => {
    if (
      item.hrid === "/items/enchanted_token" ||
      item.hrid === "/items/sinister_token" ||
      item.hrid === "/items/chimerical_token"
    )
      return true;
    else return false;
  };
  const tokenToEssenceMap = (token: MarketValue & ItemDetail) => {
    if (token.hrid === "/items/enchanted_token") {
      return data.itemDetails["/items/enchanted_essence"];
    } else if (token.hrid === "/items/sinister_token") {
      return data.itemDetails["/items/sinister_essence"];
    } else if (token.hrid === "/items/chimerical_token") {
      return data.itemDetails["/items/chimerical_essence"];
    }
    return token;
  };
  const setTokenPrice = (item: MarketValue & ItemDetail): number => {
    if (item.hrid === "/items/coin") return 1;
    else if (item.hrid === "/items/enchanted_token") {
      return (
        priceOverrides["/items/enchanted_token"] ||
        Math.round(
          ((data.itemDetails["/items/enchanted_essence"].ask < 1
            ? 0
            : data.itemDetails["/items/enchanted_essence"].ask) +
            (data.itemDetails["/items/enchanted_essence"].bid < 1
              ? 0
              : data.itemDetails["/items/enchanted_essence"].bid)) /
            2
        )
      );
    } else if (item.hrid === "/items/sinister_token") {
      return (
        priceOverrides["/items/sinister_token"] ||
        Math.round(
          ((data.itemDetails["/items/sinister_essence"].ask < 1
            ? 0
            : data.itemDetails["/items/sinister_essence"].ask) +
            (data.itemDetails["/items/sinister_essence"].bid < 1
              ? 0
              : data.itemDetails["/items/sinister_essence"].bid)) /
            2
        )
      );
    } else if (item.hrid === "/items/chimerical_token") {
      return (
        priceOverrides["/items/chimerical_token"] ||
        Math.round(
          ((data.itemDetails["/items/chimerical_essence"].ask < 1
            ? 0
            : data.itemDetails["/items/chimerical_essence"].ask) +
            (data.itemDetails["/items/chimerical_essence"].bid < 1
              ? 0
              : data.itemDetails["/items/chimerical_essence"].bid)) /
            2
        )
      );
    }
    return (
      priceOverrides[item.hrid] ||
      Math.round(
        ((item.ask < 1 ? 0 : item.ask) + (item.bid < 1 ? 0 : item.bid)) / 2
      )
    );
  };

  const getItemPrice = (item: MarketValue & ItemDetail): number => {
    if (item.hrid === "/items/coin") return 1;
    return (
      priceOverrides[item.hrid] ||
      Math.round(
        ((item.ask < 1 ? 0 : item.ask) + (item.bid < 1 ? 0 : item.bid)) / 2
      )
    );
  };
  const getItemAsk = (item: MarketValue & ItemDetail): number => {
    if (item.hrid === "/items/coin") return 1;
    return priceOverrides[item.hrid] || item.ask;
  };
  const getItemBid = (item: MarketValue & ItemDetail): number => {
    if (item.hrid === "/items/coin") return 1;
    return priceOverrides[item.hrid] || item.bid;
  };
  const getDropRateWithCoffee = (dropRate: number) => {
    let resultDropRate = dropRate;
    if (dropRate < 1) {
      resultDropRate = dropRate + dropRate * 0.15;
    }
    return resultDropRate;
  };
  const getDropRateWithFlatBoost = (dropRate: number, boost: number) => {
    let resultDropRate = dropRate;
    if (dropRate < 1) {
      resultDropRate = dropRate + dropRate * boost;
    }
    return resultDropRate;
  };
  const getDropRateWithFlatBoostAndCoffee = (
    dropRate: number,
    boost: number
  ) => {
    let resultDropRate = dropRate;
    const totalBoost = boost + 0.15;
    if (dropRate < 1) {
      resultDropRate = dropRate + dropRate * totalBoost;
    }
    return resultDropRate;
  };
  const getDropsWithCombatBuff = (avgDrop: number) => {
    const result = avgDrop + avgDrop * (0.2 + (combatBuffLevel - 1) * 0.005);
    return result;
  };

  const actionToChestMap = (action: string) => {
    if (action === "/actions/combat/chimerical_den") {
      return "/items/chimerical_chest";
    } else if (action === "/actions/combat/sinister_circus") {
      return "/items/sinister_chest";
    } else if (action === "/actions/combat/enchanted_fortress") {
      return "/items/enchanted_chest";
    }
  };
  const getTreasureChestValue = (amount: number) => {
    const treasureChestDropMapData =
      data.openableLootDropMap["/items/large_treasure_chest"];
    const treasureChestLootTable: OpenableLootDropData[] = [];
    for (const loot of treasureChestDropMapData as OpenableLootDropMap[]) {
      const avgDrop = (loot.minCount + loot.maxCount) / 2;
      const item = data.itemDetails[loot.itemHrid];
      const avgDropPerChest = avgDrop * loot.dropRate;
      const coinPerItem = getItemPrice(item);
      const itemAsk = getItemAsk(item);
      const itemBid = getItemBid(item);
      const coinPerChest = coinPerItem * avgDropPerChest;
      const totalCoin = coinPerItem * avgDropPerChest * amount;

      treasureChestLootTable.push({
        itemHrid: item.hrid,
        itemName: item.name,
        dropsPerChest: avgDropPerChest,
        coinPerItem: coinPerItem,
        coinPerChest: coinPerChest,
        totalCoins: totalCoin,
        itemAsk: itemAsk,
        itemBid: itemBid,
      } as OpenableLootDropData);
    }
    const treasureChestLootMap = treasureChestLootTable.reduce((acc, val) => {
      const temp = acc.get(val.itemHrid);
      if (temp) {
        acc.set(val.itemHrid, {
          itemHrid: val.itemHrid,
          itemName: val.itemName,
          dropsPerChest: val.dropsPerChest + temp.dropsPerChest,
          coinPerItem: val.coinPerItem,
          coinPerChest: val.coinPerChest + temp.coinPerChest,
          totalCoins: val.totalCoins + temp.totalCoins,
          itemAsk: val.itemAsk,
          itemBid: val.itemBid,
        });
      } else {
        acc.set(val.itemHrid, {
          itemHrid: val.itemHrid,
          itemName: val.itemName,
          dropsPerChest: val.dropsPerChest,
          coinPerItem: val.coinPerItem,
          coinPerChest: val.coinPerChest,
          totalCoins: val.totalCoins,
          itemAsk: val.itemAsk,
          itemBid: val.itemBid,
        });
      }
      return acc;
    }, new Map<string, OpenableLootDropData>());
    const treasureChestLootData = Array.from(treasureChestLootMap.values());
    return treasureChestLootData.reduce((acc, val) => acc + val.totalCoins, 0);
  };
  const activeChest = actionToChestMap(action);
  const openableLootDropMapData = activeChest
    ? data.openableLootDropMap[activeChest]
    : [];
  const openableLootTable: OpenableLootDropData[] = [];
  for (const loot of openableLootDropMapData as OpenableLootDropMap[]) {
    const avgDrop = (loot.minCount + loot.maxCount) / 2;
    const item = data.itemDetails[loot.itemHrid];
    const avgDropPerChest = avgDrop * loot.dropRate;
    const coinPerItem =
      loot.itemHrid === "/items/large_treasure_chest"
        ? getTreasureChestValue(avgDropPerChest)
        : isDungeonToken(item)
        ? setTokenPrice(data.itemDetails[loot.itemHrid])
        : getItemPrice(item);
    const itemAsk = isDungeonToken(item)
      ? getItemAsk(tokenToEssenceMap(data.itemDetails[loot.itemHrid]))
      : getItemAsk(item);
    const itemBid = isDungeonToken(item)
      ? getItemBid(tokenToEssenceMap(data.itemDetails[loot.itemHrid]))
      : getItemBid(item);

    const coinPerChest = coinPerItem * avgDropPerChest;
    const coinPerChestWithKph = coinPerItem * avgDropPerChest * kph;
    openableLootTable.push({
      itemHrid: item.hrid,
      itemName: item.name,
      dropsPerChest: avgDropPerChest,
      coinPerItem: coinPerItem,
      coinPerChest: coinPerChest,
      totalCoins: coinPerChestWithKph,
      itemAsk: itemAsk,
      itemBid: itemBid,
    } as OpenableLootDropData);
  }

  const openableLootMap = openableLootTable.reduce((acc, val) => {
    const temp = acc.get(val.itemHrid);
    if (temp) {
      acc.set(val.itemHrid, {
        itemHrid: val.itemHrid,
        itemName: val.itemName,
        dropsPerChest: val.dropsPerChest + temp.dropsPerChest,
        coinPerItem: val.coinPerItem,
        coinPerChest: val.coinPerChest + temp.coinPerChest,
        totalCoins: val.totalCoins + temp.totalCoins,
        itemAsk: val.itemAsk,
        itemBid: val.itemBid,
      });
    } else {
      acc.set(val.itemHrid, {
        itemHrid: val.itemHrid,
        itemName: val.itemName,
        dropsPerChest: val.dropsPerChest,
        coinPerItem: val.coinPerItem,
        coinPerChest: val.coinPerChest,
        totalCoins: val.totalCoins,
        itemAsk: val.itemAsk,
        itemBid: val.itemBid,
      });
    }
    return acc;
  }, new Map<string, OpenableLootDropData>());
  const lootMap = enemies
    .flatMap((x) => {
      const elite = data.actionDetails[action].hrid.includes("elite");
      let dropTable;
      if (elite) {
        dropTable = data.combatMonsterDetails[x.combatMonsterHrid].dropTable;
      } else {
        dropTable = data.combatMonsterDetails[
          x.combatMonsterHrid
        ].dropTable!.filter((drop) => drop.minEliteTier < 1);
      }

      return dropTable!.map((y) => {
        const elite = data.actionDetails[action].hrid.includes("elite");
        const item = data.itemDetails[y.itemHrid];
        const avgDrop = (y.minCount + y.maxCount) / 2;
        let eliteZoneFlatBoost = 0;
        if (elite) {
          if (data.actionDetails[action].buffs !== null) {
            eliteZoneFlatBoost = data.actionDetails[action].buffs![0].flatBoost;
          }
        }
        let avgDropPerKill: number;
        if (combatBuffLevel > 0) {
          if (withLuckyCoffee) {
            if (elite) {
              avgDropPerKill =
                getDropsWithCombatBuff(avgDrop) *
                getDropRateWithFlatBoostAndCoffee(
                  y.dropRate,
                  eliteZoneFlatBoost
                );
            } else {
              avgDropPerKill =
                getDropRateWithCoffee(y.dropRate) *
                getDropsWithCombatBuff(avgDrop);
            }
          } else {
            if (elite) {
              avgDropPerKill =
                getDropRateWithFlatBoost(y.dropRate, eliteZoneFlatBoost) *
                getDropsWithCombatBuff(avgDrop);
            } else {
              avgDropPerKill = y.dropRate * getDropsWithCombatBuff(avgDrop);
            }
          }
        } else if (withLuckyCoffee) {
          if (elite) {
            avgDropPerKill =
              getDropRateWithFlatBoostAndCoffee(
                y.dropRate,
                eliteZoneFlatBoost
              ) * avgDrop;
          } else {
            avgDropPerKill = getDropRateWithCoffee(y.dropRate) * avgDrop;
          }
        } else if (elite) {
          avgDropPerKill =
            getDropRateWithFlatBoost(y.dropRate, eliteZoneFlatBoost) * avgDrop;
        } else {
          avgDropPerKill = y.dropRate * avgDrop;
        }

        const dropsPerHour = (avgDropPerKill * kph * x.rate) / partyAmount;
        const coinPerItem = getItemPrice(item);
        const coinPerHour = coinPerItem * dropsPerHour;
        const itemAsk = getItemAsk(item);
        const itemBid = getItemBid(item);
        return {
          itemHrid: item.hrid,
          itemName: item.name,
          dropsPerHour,
          coinPerItem,
          coinPerHour,
          itemAsk: itemAsk,
          itemBid: itemBid,
        } as LootData;
      });
    })
    .reduce((acc, val) => {
      const temp = acc.get(val.itemHrid);
      if (temp) {
        acc.set(val.itemHrid, {
          itemHrid: val.itemHrid,
          itemName: val.itemName,
          dropsPerHour: val.dropsPerHour + temp.dropsPerHour,
          coinPerItem: val.coinPerItem,
          coinPerHour: val.coinPerHour + temp.coinPerHour,
          itemAsk: val.itemAsk,
          itemBid: val.itemBid,
        });
      } else {
        acc.set(val.itemHrid, {
          itemHrid: val.itemHrid,
          itemName: val.itemName,
          dropsPerHour: val.dropsPerHour,
          coinPerItem: val.coinPerItem,
          coinPerHour: val.coinPerHour,
          itemAsk: val.itemAsk,
          itemBid: val.itemBid,
        });
      }

      return acc;
    }, new Map<string, LootData>());
  const openableLootData = Array.from(openableLootMap.values());
  const openableLootRows = openableLootData.map((x, i) => {
    return (
      <tr key={`${action}/loot/${i}/${x.itemHrid}`}>
        <td>
          <Flex
            justify="flex-start"
            align="center"
            direction="row"
            wrap="wrap"
            gap="xs"
          >
            <Icon hrid={x.itemHrid} /> {x.itemName}
          </Flex>
        </td>
        <td>{getFriendlyIntStringRate(x.dropsPerChest)}</td>
        <td>
          <NumberInput
            hideControls
            value={priceOverrides[x.itemHrid]}
            placeholder={x.itemAsk.toString() + " / " + x.itemBid.toString()}
            disabled={x.itemHrid === "/items/coin"}
            onChange={(y) =>
              setPriceOverrides({
                ...priceOverrides,
                [x.itemHrid]: y,
              })
            }
          />
        </td>
        <td>{getFriendlyIntString(x.coinPerItem * x.dropsPerChest)}</td>
        <td>{getFriendlyIntString(x.coinPerItem * x.dropsPerChest * kph)}</td>
      </tr>
    );
  });
  const lootData = Array.from(lootMap.values());
  const lootRows = lootData.map((x, i) => {
    return (
      <tr key={`${action}/loot/${i}/${x.itemHrid}`}>
        <td>
          <Flex
            justify="flex-start"
            align="center"
            direction="row"
            wrap="wrap"
            gap="xs"
          >
            <Icon hrid={x.itemHrid} /> {x.itemName}
          </Flex>
        </td>
        <td>
          {getFriendlyIntString(
            fromRaw ? x.dropsPerHour * 24 : x.dropsPerHour,
            2
          )}
        </td>
        <td>
          <NumberInput
            hideControls
            value={priceOverrides[x.itemHrid]}
            placeholder={x.itemAsk.toString() + " / " + x.itemBid.toString()}
            disabled={x.itemHrid === "/items/coin"}
            onChange={(y) =>
              setPriceOverrides({
                ...priceOverrides,
                [x.itemHrid]: y,
              })
            }
          />
        </td>
        <td>
          {getFriendlyIntString(fromRaw ? x.coinPerHour * 24 : x.coinPerHour)}
        </td>
        <td></td>
      </tr>
    );
  });

  const totalCoins = (dungeon: boolean) => {
    if (dungeon) {
      return openableLootData.reduce((acc, val) => acc + val.totalCoins, 0);
    } else {
      return lootData.reduce((acc, val) => acc + val.coinPerHour, 0);
    }
  };
  const totalCoinsPerChest = () => {
    return openableLootData.reduce((acc, val) => acc + val.coinPerChest, 0);
  };
  return (
    <>
      <Flex
        gap="sm"
        justify="flex-start"
        align="flex-start"
        wrap="wrap"
        direction="row"
      >
        <Flex>
          <Table striped highlightOnHover withBorder withColumnBorders>
            <thead>
              <tr>
                <th>Loot</th>
                {dungeon ? (
                  <th>Rate/Chest</th>
                ) : (
                  <th>{fromRaw ? "Rate/day" : "Rate/hr"}</th>
                )}
                <th>Price/item</th>
                {dungeon ? (
                  <th>Coins/Chest</th>
                ) : (
                  <th>{fromRaw ? "Coin/day" : "Coin/hr"}</th>
                )}
                {dungeon ? <th>Total Coins</th> : <></>}

                {dungeon ? <></> : <th></th>}
              </tr>
            </thead>
            <tbody>
              {dungeon ? openableLootRows : lootRows}
              <tr>
                <th colSpan={3}>Total</th>

                <td>
                  {dungeon
                    ? getFriendlyIntString(totalCoinsPerChest())
                    : getFriendlyIntString(
                        fromRaw ? totalCoins(dungeon) * 24 : totalCoins(dungeon)
                      )}
                </td>

                {dungeon ? (
                  <td>{getFriendlyIntString(totalCoins(dungeon))}</td>
                ) : (
                  <td>
                    {" "}
                    <Switch
                      onLabel="DAY"
                      offLabel="HOUR"
                      label="Per hour or day"
                      size="xl"
                      checked={fromRaw}
                      onChange={(event) =>
                        setFromRaw(event.currentTarget.checked)
                      }
                    />
                  </td>
                )}
              </tr>
            </tbody>
          </Table>
        </Flex>
      </Flex>
      {dungeon ? (
        <></>
      ) : (
        <Flex>
          <Table striped highlightOnHover withBorder withColumnBorders>
            <thead>
              <tr>
                <th>Monster</th>
                <th>Encounter Rate</th>
              </tr>
            </thead>
            <tbody>{encounterRows}</tbody>
          </Table>
        </Flex>
      )}
    </>
  );
}
