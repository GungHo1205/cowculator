import {
  Flex,
  Group,
  MultiSelect,
  NativeSelect,
  NumberInput,
  Switch,
  Text,
} from "@mantine/core";
import Materials from "./Materials";
import { ApiData } from "../services/ApiService";
import { useEffect, useMemo, useState } from "react";
import { Skill, getTeaBonuses } from "../helpers/CommonFunctions";
import { SaveDataObject, SkillBonuses } from "../helpers/Types";

interface Props {
  skill: Skill;
  data: ApiData;
  loadedSaveData: SaveDataObject;
  onSkillBonusesChange: (skill: Skill, skillBonuses: SkillBonuses) => void;
}

export default function ActionCategorySelector({
  skill,
  data,
  loadedSaveData,
  onSkillBonusesChange,
}: Props) {
  const [fromRaw, setFromRaw] = useState(false);
  const [level, setLevel] = useState<number | "">(1);
  const [xp, setXp] = useState<number | "">("");
  const [targetLevel, setTargetLevel] = useState<number | "">("");
  const [toolBonus, setToolBonus] = useState<number | "">(0);
  const [teas, setTeas] = useState([""]);

  const { teaError, levelTeaBonus } = getTeaBonuses(teas, skill);
  useEffect(() => {
    const skillValues = Object.values(Skill);
    skillValues.forEach((value) => {
      if (skill === value) {
        setLevel(loadedSaveData.skills[value].bonuses.level);
        setToolBonus(loadedSaveData.skills[value].bonuses.toolBonus);
        setTeas(loadedSaveData.skills[value].bonuses.teas);
        setXp(loadedSaveData.skills[value].bonuses.experience || "");
        setTargetLevel(loadedSaveData.skills[value].bonuses.targetLevel || "");
      }
    });
  }, []);
  useEffect(() => {
    onSkillBonusesChange(skill, {
      bonuses: {
        level,
        toolBonus,
        teas,
        experience: xp,
        targetLevel,
      },
    });
  }, [level, toolBonus, teas, xp, targetLevel]);
  const availableTeas = Object.values(data.itemDetails)
    .filter(
      (x) =>
        x.consumableDetail.usableInActionTypeMap?.[`/action_types/${skill}`]
    )
    .map((x) => ({
      label: x.name,
      value: x.hrid,
    }));

  const options = useMemo(
    () =>
      Object.values(data.actionCategoryDetails)
        .filter((x) => x.hrid.startsWith(`/action_categories/${skill}`))
        .sort((a, b) => {
          if (a.sortIndex < b.sortIndex) return -1;
          if (a.sortIndex > b.sortIndex) return 1;
          return 0;
        })
        .map((x) => ({
          value: x.hrid,
          label: x.name,
        })),
    [skill, data.actionCategoryDetails]
  );

  const [category, setCategory] = useState(options[0].value);

  const effectiveLevel = (level || 1) + levelTeaBonus;

  return (
    <Flex
      gap="sm"
      justify="flex-start"
      align="flex-start"
      direction="column"
      wrap="wrap"
    >
      <Group>
        <NativeSelect
          label="Category"
          withAsterisk
          data={options}
          value={category}
          onChange={(event) => setCategory(event.currentTarget.value)}
        />
        <Switch
          onLabel="CRAFT UPGRADE ITEM"
          offLabel="BUY UPGRADE ITEM"
          size="xl"
          checked={fromRaw}
          onChange={(event) => setFromRaw(event.currentTarget.checked)}
        />
        <NumberInput
          value={level}
          onChange={setLevel}
          label="Level"
          withAsterisk
          hideControls
          rightSection={
            levelTeaBonus && (
              <>
                <Text c="#EE9A1D">+{levelTeaBonus}</Text>
              </>
            )
          }
        />
        <NumberInput
          value={toolBonus}
          onChange={setToolBonus}
          label="Tool Bonus"
          withAsterisk
          hideControls
          precision={2}
          formatter={(value) => `${value}%`}
        />
        <MultiSelect
          data={availableTeas}
          value={teas}
          onChange={setTeas}
          label="Teas"
          maxSelectedValues={3}
          error={teaError}
          clearable
        />
        <NumberInput
          value={xp}
          onChange={setXp}
          label="Experience"
          withAsterisk
          hideControls
        />
        <NumberInput
          value={targetLevel}
          onChange={setTargetLevel}
          label="Target Level"
          withAsterisk
          hideControls
        />
      </Group>
      {category && (
        <Materials
          actionCategory={category}
          data={data}
          effectiveLevel={effectiveLevel}
          xp={xp}
          targetLevel={targetLevel}
          toolBonus={toolBonus}
          fromRaw={fromRaw}
          teas={teas}
          skill={skill}
        />
      )}
    </Flex>
  );
}
