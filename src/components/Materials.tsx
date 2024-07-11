import { Flex, NumberInput, Table } from "@mantine/core";
import { ApiData } from "../services/ApiService";
import { Cost } from "../models/Client";
import { useMemo, useState } from "react";
import Icon from "./Icon";
import { getFriendlyIntString } from "../helpers/Formatting";
import {
  Skill,
  getActionSeconds,
  getTeaBonuses,
} from "../helpers/CommonFunctions";

interface Props {
  actionCategory: string;
  data: ApiData;
  effectiveLevel: number;
  xp: number | "";
  targetLevel: number | "";
  toolBonus: number | "";
  fromRaw: boolean;
  teas: string[];
  skill: Skill;
  itemBonusEfficiency: { eyeWatch: number; redChefsHat: number };
}
let exportInputCostEnchanted: number;
let exportInputCostSinister: number;
let exportInputCostChimerical: number;
let exportMarketRows: JSX.Element[];
export default function Materials({
  actionCategory = "/action_categories/crafting/dungeon_keys",
  data,
  effectiveLevel,
  xp,
  targetLevel,
  toolBonus,
  fromRaw = false,
  teas,
  skill,
  itemBonusEfficiency,
}: Props) {
  const [priceOverrides, setPriceOverrides] = useState<{
    [key: string]: number | "";
  }>({});
  const {
    wisdomTeaBonus,
    efficiencyTeaBonus,
    artisanTeaBonus,
    gourmetTeaBonus,
  } = getTeaBonuses(teas, skill);
  let key;
  const actions = useMemo(
    () =>
      Object.values(data.actionDetails)
        .filter((x) => x.category === actionCategory)
        .sort((a, b) => {
          if (a.sortIndex > b.sortIndex) return -1;
          if (a.sortIndex < b.sortIndex) return 1;
          return 0;
        }),
    [actionCategory, data.actionDetails]
  );
  const relevantItems = useMemo(
    () => [
      ...new Set(
        actions
          .flatMap((x) => {
            const input = x.inputItems ?? [];
            const output = x.outputItems ?? [];
            return [input, output].flat();
          })
          .map((x) => data.itemDetails[x.itemHrid])
      ),
    ],
    [actions, data.itemDetails]
  );
  const getApproxValue = (hrid: string): number => {
    if (hrid === "/items/coin") return 1;

    if (priceOverrides[hrid]) return +priceOverrides[hrid];

    const item = data.itemDetails[hrid];

    if (item.ask === -1 && item.bid === -1) {
      return item.sellPrice;
    } else if (item.ask === -1) {
      return item.bid;
    } else if (item.bid === -1) {
      return item.ask;
    } else {
      return +((item.ask + item.bid) / 2).toFixed(0);
    }
  };

  const getAveragePrice = (items: Cost[] | null): number => {
    let price = 0;

    if (!items) return price;

    price = items
      .map((y) => y.count * getApproxValue(y.itemHrid))
      .reduce((acc, val) => acc + val);

    return +price.toFixed(2);
  };
  const rows = actions.map((x) => {
    let seconds = getActionSeconds(x.baseTimeCost, toolBonus);
    let exp = x.experienceGain.value * wisdomTeaBonus;
    const levelReq = x.levelRequirement.level;
    const efficiency =
      Math.max(1, (100 + (effectiveLevel || 1) - levelReq) / 100) +
      efficiencyTeaBonus +
      (skill === "cheesesmithing" ||
      skill === "crafting" ||
      skill === "tailoring"
        ? itemBonusEfficiency.eyeWatch
        : itemBonusEfficiency.redChefsHat);

    let actionsToTarget = 0;

    let inputs: Cost[] = x.inputItems?.slice() || [];
    let upgradeHrid = x.upgradeItemHrid;
    const actions = [x];
    while (fromRaw && upgradeHrid) {
      const newItem = upgradeHrid.split("/").pop();
      if (!newItem) break;
      const newActionHrid = x.hrid
        .split("/")
        .slice(0, -1)
        .concat([newItem])
        .join("/");
      const newAction = data.actionDetails[newActionHrid];
      if (newAction.inputItems) {
        inputs = inputs.concat(newAction.inputItems);
        actions.push(newAction);
      }

      exp = exp + newAction.experienceGain.value * wisdomTeaBonus;
      seconds = seconds + getActionSeconds(newAction.baseTimeCost, toolBonus);

      upgradeHrid = newAction.upgradeItemHrid;
    }

    if (xp && targetLevel) {
      actionsToTarget = (data.levelExperienceTable[targetLevel] - xp) / exp;
    }

    const expPerHour = (exp / seconds) * 3600 * efficiency;

    inputs = inputs.map((y) => {
      return {
        ...y,
        count: y.count * artisanTeaBonus,
      };
    });

    const outputItems =
      x.outputItems?.map((y) => {
        return {
          ...y,
          count: y.count * gourmetTeaBonus,
        };
      }) ?? null;

    const inputCost = getAveragePrice(inputs);
    const outputCost = getAveragePrice(outputItems);

    const profit = outputCost - inputCost;
    const profitPerHour = (profit / seconds) * 3600 * efficiency;

    const outputItem = outputItems?.[0];
    return (
      <tr key={x.hrid}>
        <td>{levelReq}</td>
        <td>
          <Flex
            justify="flex-start"
            align="center"
            direction="row"
            wrap="wrap"
            gap="xs"
          >
            {outputItem && <Icon hrid={outputItem.itemHrid} />} {x.name}
          </Flex>
        </td>
        <td>{getFriendlyIntString(exp, 2)}</td>
        <td>{seconds.toFixed(2)}s</td>
        <td>{efficiency.toFixed(2)}</td>
        <td>{getFriendlyIntString(expPerHour)}</td>
        <td>{getFriendlyIntString(actionsToTarget)}</td>
        <td>{getFriendlyIntString(inputCost, 2)}</td>
        <td>{getFriendlyIntString(outputCost, 2)}</td>
        <td>{getFriendlyIntString(profit, 2)}</td>
        <td>{getFriendlyIntString(profitPerHour)}</td>
      </tr>
    );
  });
  const exportRows = actions.map((x) => {
    let inputs: Cost[] = x.inputItems?.slice() || [];
    let upgradeHrid = x.upgradeItemHrid;
    const actions = [x];
    while (fromRaw && upgradeHrid) {
      const newItem = upgradeHrid.split("/").pop();
      if (!newItem) break;
      const newActionHrid = x.hrid
        .split("/")
        .slice(0, -1)
        .concat([newItem])
        .join("/");
      const newAction = data.actionDetails[newActionHrid];
      if (newAction.inputItems) {
        inputs = inputs.concat(newAction.inputItems);
        actions.push(newAction);
      }

      upgradeHrid = newAction.upgradeItemHrid;
    }

    inputs = inputs.map((y) => {
      return {
        ...y,
        count: y.count * artisanTeaBonus,
      };
    });

    const outputItems =
      x.outputItems?.map((y) => {
        return {
          ...y,
          count: y.count * gourmetTeaBonus,
        };
      }) ?? null;

    const inputCost = getAveragePrice(inputs);
    const outputItem = outputItems?.[0];
    if (x.hrid.includes("key")) {
      if (x.hrid.includes("enchanted")) {
        exportInputCostEnchanted = getAveragePrice(inputs);
      }
      if (x.hrid.includes("sinister")) {
        exportInputCostSinister = getAveragePrice(inputs);
      }
      if (x.hrid.includes("chimerical")) {
        exportInputCostChimerical = getAveragePrice(inputs);
      }

      key = true;
    }
    return (
      <tr key={x.hrid}>
        <td>
          <Flex
            justify="flex-start"
            align="center"
            direction="row"
            wrap="wrap"
            gap="xs"
          >
            {outputItem && <Icon hrid={outputItem.itemHrid} />} {x.name}
          </Flex>
        </td>
        <td>{getFriendlyIntString(inputCost, 2)}</td>
      </tr>
    );
  });
  if (key) {
    exportMarketRows = exportRows;
  }
  const marketRows = relevantItems
    .filter((x) => x.hrid !== "/items/coin")
    .map((x, i) => {
      return (
        <tr key={"marketOverride" + actionCategory + x.hrid + i}>
          <td>
            <Flex
              justify="flex-start"
              align="center"
              direction="row"
              wrap="wrap"
              gap="xs"
            >
              <Icon hrid={x.hrid} /> {x.name}
            </Flex>
          </td>
          <td>{x.ask}</td>
          <td>{x.bid}</td>
          <td>{x.sellPrice}</td>
          <td>
            <NumberInput
              hideControls
              value={priceOverrides[x.hrid]}
              placeholder={`${getApproxValue(x.hrid)}`}
              onChange={(y) =>
                setPriceOverrides({
                  ...priceOverrides,
                  [x.hrid]: y,
                })
              }
            />
          </td>
        </tr>
      );
    });
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
                <th>Item</th>
                <th>Median Ask</th>
                <th>Median Bid</th>
                <th>Vendor</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>{marketRows}</tbody>
          </Table>
        </Flex>
        <Flex>
          <Table striped highlightOnHover withBorder withColumnBorders>
            <thead>
              <tr>
                <th>Level</th>
                <th>Item</th>
                <th>XP</th>
                <th>Time</th>
                <th>Efficiency</th>
                <th>XP/h</th>
                <th>Actions to Target</th>
                <th>Input Cost</th>
                <th>Output Cost</th>
                <th>Profit</th>
                <th>Profit/h</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </Table>
        </Flex>
      </Flex>
    </>
  );
}
export {
  exportInputCostEnchanted,
  exportInputCostSinister,
  exportInputCostChimerical,
  exportMarketRows,
};
