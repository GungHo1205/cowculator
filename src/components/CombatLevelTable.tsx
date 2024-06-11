// import { useEffect, useState } from "react";
// import { ApiData } from "../services/ApiService";
// import { Flex, Switch, Table } from "@mantine/core";
// import { NecklaceOfWisdom } from "../helpers/Types";

// type TimeNeededDaysHoursMinutes = {
//   days: number;
//   hours: number;
//   minutes: number;
// };

// interface Props {
//   data: ApiData;
//   action: string;
//   kph: number;
//   style: string | null;
//   level: number | "";
//   xp: number | "";
//   targetLevel: number | "";
//   necklaceOfWisdom: NecklaceOfWisdom;
//   withWisdomCoffee: boolean;
// }

// export default function CombatLevelTable({
//   action,
//   data,
//   kph,
//   style,
//   level,
//   xp,
//   targetLevel,
//   necklaceOfWisdom,
//   withWisdomCoffee,
// }: Props) {
//   const [fromRaw, setFromRaw] = useState(false);
//   const [expMultiplier, setExpMultiplier] = useState<number>(0);

//   const getRandomEncounter = () => {
//     const spawns = data.actionDetails[action].monsterSpawnInfo.spawns ?? [];
//     const totalWeight = spawns.reduce((prev, cur) => prev + cur.rate, 0);

//     const encounterHrids = [];
//     let totalStrength = 0;

//     outer: for (
//       let i = 0;
//       i < data.actionDetails[action].monsterSpawnInfo.maxSpawnCount;
//       i++
//     ) {
//       const randomWeight = totalWeight * Math.random();
//       let cumulativeWeight = 0;

//       for (const spawn of spawns) {
//         cumulativeWeight += spawn.rate;
//         if (randomWeight <= cumulativeWeight) {
//           totalStrength += spawn.strength;

//           if (
//             totalStrength <=
//             data.actionDetails[action].monsterSpawnInfo.maxTotalStrength
//           ) {
//             encounterHrids.push(spawn.combatMonsterHrid);
//           } else {
//             break outer;
//           }
//           break;
//         }
//       }
//     }
//     return encounterHrids;
//   };

//   const getMultipleEncounters = (kph: number): string[][] => {
//     const encounterList = [];
//     const bossName: string[] = [];
//     bossName.push(
//       data.actionDetails[action].monsterSpawnInfo.bossSpawns![0]
//         .combatMonsterHrid
//     );

//     for (let i = 1; i < kph + 1; i++) {
//       if (
//         i % 10 === 0 &&
//         i !== 0 &&
//         data.actionDetails[action].monsterSpawnInfo.bossSpawns !== null
//       ) {
//         encounterList.push(bossName ?? getRandomEncounter());
//       } else encounterList.push(getRandomEncounter());
//     }
//     return encounterList;
//   };

//   const getTotalKillsPerMonster = (encounterList: string[][]) => {
//     const count = encounterList
//       .flat()
//       .reduce((acc: { [name: string]: number }, value: string) => {
//         acc[value] = ++acc[value] || 1;
//         return acc;
//       }, {});
//     return count;
//   };

//   const calculateAttackExperience = (damage: number, combatStyle: string) => {
//     switch (combatStyle) {
//       case "Stab":
//         return 0.6 + 0.15 * damage;
//       case "Slash":
//         return 0.3 + 0.075 * damage;
//       default:
//         return 0;
//     }
//   };

//   const calculatePowerExperience = (damage: number, combatStyle: string) => {
//     switch (combatStyle) {
//       case "Smash":
//         return 0.6 + 0.15 * damage;
//       case "Slash":
//         return 0.3 + 0.075 * damage;
//       default:
//         return 0;
//     }
//   };
//   const calculateRangedExperience = (damage: number) => {
//     const baseExp = 0.4 + 0.1 * damage;
//     return baseExp;
//   };

//   const calculateMagicExperience = (damage: number) => {
//     const baseExp = 0.4 + 0.1 * damage;
//     // const EstimatedExp = baseExp + baseExp * 0.3;
//     return baseExp;
//   };

//   const getMonsterHitpoints = (totalKillsPerMonster: {
//     [name: string]: number;
//   }) => {
//     const planetSpawnRate: { combatMonsterHrid: string; hitpoints: number }[] =
//       [];
//     const monsterNames = Object.keys(totalKillsPerMonster);
//     monsterNames.map((x) => {
//       const monster = data.combatMonsterDetails[x];

//       monsterNames.forEach((monsterName) => {
//         if (monster.hrid === monsterName) {
//           planetSpawnRate.push({
//             combatMonsterHrid: monster.hrid,
//             hitpoints:
//               monster.combatDetails.maxHitpoints *
//               totalKillsPerMonster[monsterName],
//           });
//         }
//       });
//     });
//     return planetSpawnRate;
//   };

//   const getTotalMonsterHitpoints = (
//     monsterHitpoints: { combatMonsterHrid: string; hitpoints: number }[]
//   ) => {
//     const totalMonnsterHitpoints = monsterHitpoints.reduce(
//       (total, obj) => obj.hitpoints + total,
//       0
//     );
//     return totalMonnsterHitpoints;
//   };

//   const getExpPerHourUsingStyle = (
//     style: string | null,
//     kph: number,
//     expMultiplier: number
//   ) => {
//     let exp = 0;
//     const stabAttackExp = calculateAttackExperience(
//       getTotalMonsterHitpoints(
//         getMonsterHitpoints(getTotalKillsPerMonster(getMultipleEncounters(kph)))
//       ),
//       "Stab"
//     );
//     const slashAttackExp = calculateAttackExperience(
//       getTotalMonsterHitpoints(
//         getMonsterHitpoints(getTotalKillsPerMonster(getMultipleEncounters(kph)))
//       ),
//       "Slash"
//     );
//     const smashPowerExp = calculatePowerExperience(
//       getTotalMonsterHitpoints(
//         getMonsterHitpoints(getTotalKillsPerMonster(getMultipleEncounters(kph)))
//       ),
//       "Smash"
//     );
//     const rangedExp = calculateRangedExperience(
//       getTotalMonsterHitpoints(
//         getMonsterHitpoints(getTotalKillsPerMonster(getMultipleEncounters(kph)))
//       )
//     );
//     const magicExp = calculateMagicExperience(
//       getTotalMonsterHitpoints(
//         getMonsterHitpoints(getTotalKillsPerMonster(getMultipleEncounters(kph)))
//       )
//     );
//     switch (style) {
//       case "Stab":
//         exp =
//           expMultiplier === 0
//             ? stabAttackExp
//             : stabAttackExp + stabAttackExp * expMultiplier;
//         return exp;
//       case "Slash":
//         exp =
//           expMultiplier === 0
//             ? slashAttackExp
//             : slashAttackExp + slashAttackExp * expMultiplier;
//         return exp;
//       case "Smash":
//         exp =
//           expMultiplier === 0
//             ? smashPowerExp
//             : smashPowerExp + smashPowerExp * expMultiplier;
//         return exp;
//       case "Ranged":
//         exp =
//           expMultiplier === 0
//             ? rangedExp
//             : rangedExp + rangedExp * expMultiplier;
//         return exp;
//       case "Magic":
//         exp =
//           expMultiplier === 0 ? magicExp : magicExp + magicExp * expMultiplier;
//         return exp;
//       default:
//         return 0;
//     }
//   };

//   const getExpToTargetLevel = (
//     xp: number | "",
//     level: number | "",
//     targetLevel: number | ""
//   ) => {
//     let expToTargetLevel = 0;
//     if ((xp || level) && targetLevel) {
//       if (
//         level !== "" &&
//         (xp === "" || xp < data.levelExperienceTable[level])
//       ) {
//         expToTargetLevel =
//           data.levelExperienceTable[targetLevel] -
//           data.levelExperienceTable[level];
//       } else if (level === "" && xp !== "") {
//         expToTargetLevel = data.levelExperienceTable[targetLevel] - xp;
//       } else if (level !== "" && xp !== "") {
//         if (xp < data.levelExperienceTable[level]) {
//           expToTargetLevel =
//             data.levelExperienceTable[targetLevel] -
//             data.levelExperienceTable[level];
//         } else expToTargetLevel = data.levelExperienceTable[targetLevel] - xp;
//       }
//     }
//     return expToTargetLevel;
//   };

//   const getTimeNeeded = (expToTargetLevel: number, expPerHour: number) => {
//     return expToTargetLevel / expPerHour;
//   };
//   const toHoursAndMinutesFromHours = (totalHours: number) => {
//     const totalMinutes = totalHours * 60;
//     const hours = Math.floor(totalMinutes / 60);
//     const minutes = totalMinutes % 60;
//     return { hours, minutes };
//   };

//   const toDaysAndHoursFromDays = (
//     totalDays: number
//   ): TimeNeededDaysHoursMinutes => {
//     const totalHours = totalDays * 24;
//     const days = Math.floor(totalHours / 24);
//     const remainder = totalHours % 24;
//     const hours = Math.floor(totalHours % 24);
//     const minutes = Math.floor(60 * (remainder - hours));
//     return { days, hours, minutes };
//   };

//   const [expPerHour, setExpPerHour] = useState<number>(
//     getExpPerHourUsingStyle(style, kph, expMultiplier)
//   );

//   useEffect(() => {
//     setExpPerHour(getExpPerHourUsingStyle(style, kph, expMultiplier));
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [style, kph, expMultiplier]); // only change when there's kph change

//   const getWisdomCoffeeBonus = (withWisdomCoffee: boolean) => {
//     const wisdomCoffee = data.itemDetails["/items/wisdom_coffee"];
//     const wisdomCoffeeBuffs = wisdomCoffee.consumableDetail.buffs ?? [];
//     const wisdomCoffeeExperienceBuff = wisdomCoffeeBuffs[0].flatBoost;
//     return withWisdomCoffee ? wisdomCoffeeExperienceBuff : 0;
//   };
//   const getNecklaceOfWisdomBonusWithEnhancement = ({
//     withNecklaceOfWisdom,
//     enhancementLevel,
//   }: NecklaceOfWisdom): number => {
//     const necklaceOfWisdomItem =
//       data.itemDetails["/items/necklace_of_wisdom"].equipmentDetail;
//     const necklaceOfWisdomExperienceBonus =
//       necklaceOfWisdomItem.combatStats.combatExperience;
//     const enhancementBonusTable =
//       data.enhancementLevelTotalBonusMultiplierTable;
//     const necklaceOfWisdomExperienceBonusWithEnhancement =
//       necklaceOfWisdomExperienceBonus +
//       necklaceOfWisdomExperienceBonus *
//         ((enhancementBonusTable[enhancementLevel] * 2 * 5) / 100);
//     return withNecklaceOfWisdom
//       ? necklaceOfWisdomExperienceBonusWithEnhancement
//       : 0;
//   };
//   const getTotalExperienceMultiplier = (
//     wisdomCoffeeBonus: number,
//     necklaceOfWisdomBonusWithEnhancement: number
//   ) => {
//     return wisdomCoffeeBonus + necklaceOfWisdomBonusWithEnhancement;
//   };
//   useEffect(() => {
//     setExpMultiplier(
//       getTotalExperienceMultiplier(
//         getWisdomCoffeeBonus(withWisdomCoffee),
//         getNecklaceOfWisdomBonusWithEnhancement(necklaceOfWisdom)
//       )
//     );
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [withWisdomCoffee, necklaceOfWisdom]);
//   return (
//     <>
//       <Flex>
//         {action && style && (level || xp) && targetLevel && kph && (
//           <Table striped highlightOnHover withBorder withColumnBorders>
//             <thead>
//               <tr>
//                 <th>Exp needed to target level</th>
//                 {(style === "Stab" ||
//                   style === "Smash" ||
//                   style === "Slash") && (
//                   <th>Attack Exp per {fromRaw ? "day" : "hour"}</th>
//                 )}
//                 {(style === "Stab" ||
//                   style === "Smash" ||
//                   style === "Slash") && (
//                   <th>Power Exp per {fromRaw ? "day" : "hour"}</th>
//                 )}
//                 {(style === "Ranged" || style === "Magic") && (
//                   <th>
//                     {style} Exp per {fromRaw ? "day" : "hour"}
//                   </th>
//                 )}
//                 <th>
//                   Time needed {fromRaw ? "in days" : "in hours"} (approximated)
//                 </th>
//                 <th></th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>
//                   {getExpToTargetLevel(xp, level, targetLevel).toString()}
//                 </td>
//                 {(style === "Stab" ||
//                   style === "Smash" ||
//                   style === "Slash") && (
//                   <td>
//                     {style === "Smash"
//                       ? (expPerHour / 10).toFixed(0)
//                       : expPerHour.toFixed(0)}
//                   </td>
//                 )}
//                 {(style === "Stab" ||
//                   style === "Smash" ||
//                   style === "Slash") && (
//                   <td>
//                     {style === "Stab"
//                       ? (expPerHour / 10).toFixed(0)
//                       : expPerHour.toFixed(0)}
//                   </td>
//                 )}
//                 {(style === "Ranged" || style === "Magic") && (
//                   <td>
//                     {fromRaw
//                       ? (expPerHour * 24).toFixed(0)
//                       : expPerHour.toFixed(0)}
//                   </td>
//                 )}

//                 <td>
//                   {fromRaw
//                     ? (
//                         getTimeNeeded(
//                           getExpToTargetLevel(xp, level, targetLevel),
//                           expPerHour
//                         ) / 24
//                       ).toFixed(2)
//                     : getTimeNeeded(
//                         getExpToTargetLevel(xp, level, targetLevel),
//                         expPerHour
//                       ).toFixed(2)}
//                   {fromRaw ? " days" : " hours"} or{" "}
//                   {fromRaw
//                     ? toDaysAndHoursFromDays(
//                         getTimeNeeded(
//                           getExpToTargetLevel(xp, level, targetLevel),
//                           expPerHour
//                         ) / 24
//                       ).days.toFixed(0) +
//                       " days " +
//                       toDaysAndHoursFromDays(
//                         getTimeNeeded(
//                           getExpToTargetLevel(xp, level, targetLevel),
//                           expPerHour
//                         ) / 24
//                       ).hours.toFixed(0) +
//                       " hours and " +
//                       toDaysAndHoursFromDays(
//                         getTimeNeeded(
//                           getExpToTargetLevel(xp, level, targetLevel),
//                           expPerHour
//                         ) / 24
//                       ).minutes.toFixed(0) +
//                       " minutes"
//                     : toHoursAndMinutesFromHours(
//                         getTimeNeeded(
//                           getExpToTargetLevel(xp, level, targetLevel),
//                           expPerHour
//                         )
//                       ).hours.toFixed(0) +
//                       " hours and " +
//                       toHoursAndMinutesFromHours(
//                         getTimeNeeded(
//                           getExpToTargetLevel(xp, level, targetLevel),
//                           expPerHour
//                         )
//                       ).minutes.toFixed(0) +
//                       " minutes"}
//                 </td>
//                 <td>
//                   <Switch
//                     onLabel="DAY"
//                     offLabel="HOUR"
//                     label="Per hour or day"
//                     size="xl"
//                     checked={fromRaw}
//                     onChange={(event) =>
//                       setFromRaw(event.currentTarget.checked)
//                     }
//                   />
//                 </td>
//               </tr>
//               <tr></tr>
//             </tbody>
//           </Table>
//         )}
//       </Flex>
//     </>
//   );
// }
