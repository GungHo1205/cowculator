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
import {
  EyeWatch,
  ProductionItemBonuses,
  RedChefsHat,
  SaveDataObject,
  SkillBonuses,
} from "../helpers/Types";

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
  const [eyeWatch, setEyeWatch] = useState<EyeWatch>({
    type: "EyeWatch",
    withEyeWatch: false,
    enhancementLevel: 0,
  });
  const [redChefsHat, setRedChefsHat] = useState<RedChefsHat>({
    type: "RedChefsHat",
    withRedChefsHat: false,
    enhancementLevel: 0,
  });
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

        setEyeWatch(
          loadedSaveData.skills[value].itemBonuses!.eyeWatch ?? {
            type: "EyeWatch",
            withEyeWatch: false,
            enhancementLevel: 0,
          }
        );
        setRedChefsHat(
          loadedSaveData.skills[value].itemBonuses!.redChefsHat ?? {
            type: "RedChefsHat",
            withRedChefsHat: false,
            enhancementLevel: 0,
          }
        );
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
      itemBonuses: { eyeWatch, redChefsHat },
    });
  }, [level, toolBonus, teas, xp, targetLevel, eyeWatch, redChefsHat]);

  const handleChange = (x: ProductionItemBonuses, n: number) => {
    if (getIsEyeWatch(x)) {
      setEyeWatch({
        type: "EyeWatch",
        withEyeWatch: true,
        enhancementLevel: n,
      });
    } else {
      setRedChefsHat({
        type: "RedChefsHat",
        withRedChefsHat: true,
        enhancementLevel: n,
      });
    }
  };

  const getIsEyeWatch = (arg: ProductionItemBonuses): arg is EyeWatch => {
    return arg.type === "EyeWatch" && arg.enhancementLevel !== undefined;
  };
  const getItemBonusWithEnhancement = (item: ProductionItemBonuses): number => {
    if (getIsEyeWatch(item)) {
      const eyeWatchItem = data.itemDetails["/items/eye_watch"].equipmentDetail;
      const eyeWatchEfficiencyBonus =
        eyeWatchItem.noncombatStats.cheesesmithingEfficiency;
      const enhancementBonusTable =
        data.enhancementLevelTotalBonusMultiplierTable;
      const eyeWatchEfficiencyBonusWithEnhancement =
        eyeWatchEfficiencyBonus +
        eyeWatchEfficiencyBonus *
          ((enhancementBonusTable[eyeWatch.enhancementLevel] * 2) / 100);
      return eyeWatch.withEyeWatch ? eyeWatchEfficiencyBonusWithEnhancement : 0;
    } else {
      const redChefsHatItem =
        data.itemDetails["/items/red_chefs_hat"].equipmentDetail;
      const redChefsHatEfficiencyBonus =
        redChefsHatItem.noncombatStats.cookingEfficiency;
      const enhancementBonusTable =
        data.enhancementLevelTotalBonusMultiplierTable;
      const redChefsHatEfficiencyBonusWithEnhancement =
        redChefsHatEfficiencyBonus +
        redChefsHatEfficiencyBonus *
          ((enhancementBonusTable[redChefsHat.enhancementLevel] * 2) / 100);
      return redChefsHat.withRedChefsHat
        ? redChefsHatEfficiencyBonusWithEnhancement
        : 0;
    }
  };
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

  const [category, setCategory] = useState(options.at(-1)!.value);

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
        {(skill === "cheesesmithing" ||
          skill === "crafting" ||
          skill === "tailoring") && (
          <Switch
            onLabel="WITH EYE WATCH"
            offLabel="NO EYE WATCH"
            size="xl"
            checked={eyeWatch.withEyeWatch}
            onChange={(event) =>
              setEyeWatch({
                type: "EyeWatch",
                withEyeWatch: event.currentTarget.checked,
                enhancementLevel: 0,
              })
            }
          />
        )}
        {eyeWatch.withEyeWatch && (
          <NumberInput
            value={eyeWatch.enhancementLevel}
            onChange={(n) => {
              handleChange(eyeWatch, n === "" ? 0 : n);
            }}
            label="Enhancement Level"
            hideControls
          />
        )}
        {(skill === "cooking" || skill === "brewing") && (
          <Switch
            onLabel="WITH RED CHEF'S HAT"
            offLabel="NO RED CHEF'S HAT"
            size="xl"
            checked={redChefsHat.withRedChefsHat}
            onChange={(event) =>
              setRedChefsHat({
                type: "RedChefsHat",
                withRedChefsHat: event.currentTarget.checked,
                enhancementLevel: 0,
              })
            }
          />
        )}
        {redChefsHat.withRedChefsHat && (
          <NumberInput
            value={redChefsHat.enhancementLevel}
            onChange={(n) => {
              handleChange(redChefsHat, n === "" ? 0 : n);
            }}
            label="Enhancement Level"
            hideControls
          />
        )}
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
          itemBonusEfficiency={{
            eyeWatch: getItemBonusWithEnhancement(eyeWatch),
            redChefsHat: getItemBonusWithEnhancement(redChefsHat),
          }}
        />
      )}
    </Flex>
  );
}
