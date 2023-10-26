import { useEffect, useMemo, useState } from "react";
import {
  Flex,
  Group,
  MultiSelect,
  NumberInput,
  Select,
  Tooltip,
  Text,
  Switch,
} from "@mantine/core";
import { ApiData } from "../services/ApiService";
import EnhancingCalc from "./EnhancingCalc";
import { ActionType } from "../models/Client";
import { Skill, getTeaBonuses } from "../helpers/CommonFunctions";
import {
  EnchantedGloves,
  SaveDataObject,
  SkillBonuses,
} from "../helpers/Types";

interface Props {
  data: ApiData;
  loadedSaveData: SaveDataObject;
  onSkillBonusesChange: (skill: Skill, skillBonuses: SkillBonuses) => void;
}

export default function Enhancing({
  data,
  loadedSaveData,
  onSkillBonusesChange,
}: Props) {
  const skill = Skill.Enhancing;
  const [item, setItem] = useState<string | null>(null);
  const [level, setLevel] = useState<number | "">(1);
  const [toolBonus, setToolBonus] = useState<number | "">(0);
  const [teas, setTeas] = useState<string[]>([]);
  const [target, setTarget] = useState<number>(1);
  const [enchantedGloves, setEnchantedGloves] = useState<EnchantedGloves>({
    withEnchantedGloves: false,
    enhancementLevel: 0,
  });
  const [laboratoryLevel, setLaboratoryLevel] = useState<number | "">(0);
  const handleEnhancementLevelChange = (n: number) => {
    setEnchantedGloves({ withEnchantedGloves: true, enhancementLevel: n });
  };
  const getEnchantedGlovesBonusWithEnhancement = (
    enchantedGloves: EnchantedGloves
  ): number => {
    const enchantedGlovesItem =
      data.itemDetails["/items/enchanted_gloves"].equipmentDetail;
    const enchantedGlovesEfficiencyBonus =
      enchantedGlovesItem.noncombatStats.enhancingSpeed;
    const enhancementBonusTable =
      data.enhancementLevelTotalBonusMultiplierTable;
    const enchantedGlovesEfficiencyBonusWithEnhancement =
      enchantedGlovesEfficiencyBonus +
      enchantedGlovesEfficiencyBonus *
        ((enhancementBonusTable[enchantedGloves.enhancementLevel] * 2) / 100);
    return enchantedGloves.withEnchantedGloves
      ? enchantedGlovesEfficiencyBonusWithEnhancement
      : 0;
  };
  const availableTeas = useMemo(
    () =>
      Object.values(data.itemDetails)
        .filter(
          (x) =>
            x.consumableDetail.usableInActionTypeMap?.[ActionType.Enhancing]
        )
        .map((x) => ({
          label: x.name,
          value: x.hrid,
        })),
    [data.itemDetails]
  );

  const { teaError, levelTeaBonus } = getTeaBonuses(teas, skill);
  useEffect(() => {
    const skillValues = Object.values(Skill);
    skillValues.forEach((value) => {
      if (skill === value) {
        setLevel(loadedSaveData.skills[value].bonuses.level || "");
        setToolBonus(loadedSaveData.skills[value].bonuses.toolBonus || 0);
        setTeas(loadedSaveData.skills[value].bonuses.teas || []);
        setItem(loadedSaveData.skills[value].item?.item || null);
        setTarget(loadedSaveData.skills[value].item?.target || 1);
        setEnchantedGloves(
          loadedSaveData.skills[value].itemBonuses!.enchantedGloves ?? {
            withEnchantedGloves: false,
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
      },
      item: { item, target },
      itemBonuses: { enchantedGloves },
    });
  }, [level, toolBonus, teas, item, target, enchantedGloves]);
  const items = useMemo(
    () =>
      Object.values(data.itemDetails)
        .filter((x) => x.enhancementCosts)
        .sort((a, b) => {
          if (a.sortIndex < b.sortIndex) return -1;
          if (a.sortIndex > b.sortIndex) return 1;
          return 0;
        }),
    [data.itemDetails]
  );

  const itemOptions = useMemo(
    () =>
      items.map((x) => ({
        value: x.hrid,
        label: x.name,
      })),
    [items]
  );

  return (
    <Flex
      gap="sm"
      justify="flex-start"
      align="flex-start"
      direction="column"
      wrap="wrap"
    >
      <Group>
        <NumberInput
          value={level}
          onChange={setLevel}
          label="Enhancing Level"
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
        <NumberInput
          value={laboratoryLevel}
          onChange={setLaboratoryLevel}
          label="Laboratory Level"
          hideControls
          max={8}
        />
        <Tooltip
          label="Tea costs are not yet included in cost calculations."
          withArrow
        >
          <MultiSelect
            clearable
            data={availableTeas}
            value={teas}
            onChange={setTeas}
            label="Teas"
            maxSelectedValues={3}
            error={teaError}
          />
        </Tooltip>
        <Switch
          onLabel="WITH ENCHANTED GLOVES"
          offLabel="NO ENCHANTED GLOVES"
          size="xl"
          checked={enchantedGloves.withEnchantedGloves}
          onChange={(event) =>
            setEnchantedGloves({
              withEnchantedGloves: event.currentTarget.checked,
              enhancementLevel: 0,
            })
          }
        />
        {enchantedGloves.withEnchantedGloves && (
          <NumberInput
            value={enchantedGloves.enhancementLevel}
            onChange={handleEnhancementLevelChange}
            label="Enhancement Level"
            hideControls
          />
        )}
      </Group>
      <Group>
        <Select
          searchable
          size="lg"
          value={item}
          onChange={setItem}
          data={itemOptions}
          label="Select an item"
          placeholder="Pick one"
        />
        <NumberInput
          value={target}
          onChange={(value) => setTarget(value || 1)}
          label="Target Level"
          withAsterisk
          min={1}
          max={20}
        />
      </Group>
      {item && (
        <EnhancingCalc
          data={data}
          item={data.itemDetails[item]}
          baseLevel={level || 1}
          toolPercent={toolBonus || 0}
          target={target}
          teas={teas}
          itemBonus={{
            enchantedGloves:
              getEnchantedGlovesBonusWithEnhancement(enchantedGloves),
          }}
          laboratoryLevel={Math.max(0, Math.min(8, Number(laboratoryLevel)))}
        />
      )}
    </Flex>
  );
}
