// import {
//   Flex,
//   Group,
//   NumberInput,
//   Select,
//   Switch,
//   TextInput,
//   Title,
//   rem,
// } from "@mantine/core";
// import { ApiData } from "../services/ApiService";
// import { ActionFunction } from "../models/Client";
// import { useEffect, useState } from "react";
// import CombatLevelTable from "./CombatLevelTable";
// import { NecklaceOfWisdom } from "../helpers/Types";
// import { CombatData, SaveDataObject } from "../helpers/Types";

// interface Props {
//   data: ApiData;
//   loadedSaveData: SaveDataObject;
//   onCombatSkillChange: (type: string, bonuses: CombatData) => void;
// }
// export default function CombatLevel({
//   data,
//   loadedSaveData,
//   onCombatSkillChange,
// }: Props) {
//   const [action, setAction] = useState<string | null>(null);
//   const [kph, setKph] = useState<number>(0);
//   const [style, setStyle] = useState<string | null>(null);
//   const [level, setLevel] = useState<number | "">(1);
//   const [xp, setXp] = useState<number | "">("");
//   const [targetLevel, setTargetLevel] = useState<number | "">("");
//   const [withWisdomCoffee, setWithWisdomCoffee] = useState<boolean>(false);
//   const [necklaceOfWisdom, setNecklaceOfWisdom] = useState<NecklaceOfWisdom>({
//     withNecklaceOfWisdom: false,
//     enhancementLevel: 0,
//   });
//   const actions = Object.values(data.actionDetails)
//     .filter((x) => x.function === ActionFunction.Combat)
//     .sort((a, b) => {
//       if (a.sortIndex < b.sortIndex) return -1;
//       if (a.sortIndex > b.sortIndex) return 1;
//       return 0;
//     })
//     .map((x) => ({
//       value: x.hrid,
//       label: x.name,
//     }));
//   const combatStyles: string[] = ["Stab", "Slash", "Smash", "Ranged", "Magic"];
//   const handleEnhancementLevelChange = (n: number) => {
//     setNecklaceOfWisdom({ withNecklaceOfWisdom: true, enhancementLevel: n });
//   };
//   useEffect(() => {
//     setAction(loadedSaveData.skills.combatLevel.data.zone);
//     setKph(loadedSaveData.skills.combatLevel.data.encountersHr);
//     setLevel(loadedSaveData.skills.combatLevel.bonuses?.level || "");
//     setXp(loadedSaveData.skills.combatLevel.bonuses?.experience || "");

//     setTargetLevel(
//       loadedSaveData.skills.combatLevel.bonuses?.targetLevel || ""
//     );

//     setWithWisdomCoffee(
//       loadedSaveData.skills.combatLevel.bonuses?.withWisdomCoffee || false
//     );

//     setNecklaceOfWisdom({
//       withNecklaceOfWisdom:
//         loadedSaveData.skills.combatLevel.bonuses?.withNecklaceOfWisdom ||
//         false,
//       enhancementLevel:
//         loadedSaveData.skills.combatLevel.bonuses?.enhancementLevel || 0,
//     });
//   }, []);
//   useEffect(() => {
//     onCombatSkillChange("level", {
//       data: {
//         zone: action || null,
//         encountersHr: kph,
//       },
//       bonuses: {
//         level: level || "",
//         experience: xp || "",
//         targetLevel: targetLevel || "",
//         withWisdomCoffee: withWisdomCoffee || false,
//         withNecklaceOfWisdom: necklaceOfWisdom.withNecklaceOfWisdom || false,
//         enhancementLevel: necklaceOfWisdom.enhancementLevel || 0,
//       },
//     });
//   }, [action, kph]);
//   const handleExperienceChange = (input: string): number => {
//     let output = 0;
//     if (input !== "") output = parseFloat(input.replace(/,/g, ""));
//     else output = 0;
//     return output;
//   };

//   return (
//     <>
//       <Title
//         order={2}
//         style={{ fontSize: rem(34), fontWeight: 900 }}
//         ta="center"
//         mt="sm"
//       >
//         (WIP) Only uses base exp gained from enemy hp (doesn't accurately
//         provide exp)
//       </Title>
//       <Flex
//         gap="sm"
//         justify="flex-start"
//         align="flex-start"
//         direction="column"
//         wrap="wrap"
//       >
//         <Group>
//           <Select
//             searchable
//             clearable
//             withAsterisk
//             size="lg"
//             value={action}
//             onChange={setAction}
//             data={actions}
//             label="Select a zone"
//             placeholder="Pick one"
//           />
//           <Select
//             clearable
//             data={combatStyles}
//             value={style}
//             onChange={setStyle}
//             label="Style"
//           />
//           <NumberInput
//             value={level}
//             onChange={setLevel}
//             label="Level"
//             withAsterisk
//             hideControls
//           />
//           <TextInput
//             value={xp}
//             onChange={(event) => {
//               setXp(handleExperienceChange(event.currentTarget.value));
//             }}
//             label="Experience"
//             withAsterisk
//           />
//           <NumberInput
//             value={targetLevel}
//             onChange={setTargetLevel}
//             label="Target Level"
//             withAsterisk
//             hideControls
//           />
//           <Switch
//             onLabel="WITH WISDOM COFFEE"
//             offLabel="NO WISDOM COFFEE"
//             size="xl"
//             checked={withWisdomCoffee}
//             onChange={(event) =>
//               setWithWisdomCoffee(event.currentTarget.checked)
//             }
//           />
//           <Switch
//             onLabel="WITH NECKLACE OF WISDOM"
//             offLabel="NO NECKLACE OF WISDOM"
//             size="xl"
//             checked={necklaceOfWisdom.withNecklaceOfWisdom}
//             onChange={(event) =>
//               setNecklaceOfWisdom({
//                 withNecklaceOfWisdom: event.currentTarget.checked,
//                 enhancementLevel: 0,
//               })
//             }
//           />
//           {necklaceOfWisdom.withNecklaceOfWisdom && (
//             <NumberInput
//               value={necklaceOfWisdom.enhancementLevel}
//               onChange={handleEnhancementLevelChange}
//               label="Enhancement Level"
//               hideControls
//             />
//           )}
//         </Group>
//         <NumberInput
//           value={kph}
//           onChange={(val) => setKph(val || 0)}
//           label="Encounters/hr"
//           withAsterisk
//           hideControls
//           min={0}
//           precision={2}
//         />
//         {action && kph > 0 && (
//           <CombatLevelTable
//             action={action}
//             data={data}
//             kph={kph}
//             style={style}
//             level={level}
//             xp={xp}
//             targetLevel={targetLevel}
//             necklaceOfWisdom={necklaceOfWisdom}
//             withWisdomCoffee={withWisdomCoffee}
//           />
//         )}
//       </Flex>
//     </>
//   );
// }
