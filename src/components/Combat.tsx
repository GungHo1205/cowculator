import { Flex, NumberInput, Select } from "@mantine/core";
import { ApiData } from "../services/ApiService";
import { ActionFunction } from "../models/Client";
import { useEffect, useState } from "react";
import CombatTable from "./CombatTable";
import { CombatData, SaveDataObject } from "../helpers/Types";

interface Props {
  data: ApiData;
  loadedSaveData: SaveDataObject;
  onCombatSkillChange: (type: string, bonuses: CombatData) => void;
}

export default function Combat({
  data,
  loadedSaveData,
  onCombatSkillChange,
}: Props) {
  const [action, setAction] = useState<string | null>(null);
  const [kph, setKph] = useState<number>(0);
  const actions = Object.values(data.actionDetails)
    .filter((x) => x.function === ActionFunction.Combat)
    .sort((a, b) => {
      if (a.sortIndex < b.sortIndex) return -1;
      if (a.sortIndex > b.sortIndex) return 1;
      return 0;
    })
    .map((x) => ({
      value: x.hrid,
      label: x.name,
    }));
  useEffect(() => {
    setAction(loadedSaveData.skills.combatLoot.data.zone);
    setKph(loadedSaveData.skills.combatLoot.data.encountersHr);
  }, []);
  useEffect(() => {
    onCombatSkillChange("loot", {
      data: {
        zone: action || "",
        encountersHr: kph,
      },
    });
  }, [action, kph]);
  return (
    <Flex
      gap="sm"
      justify="flex-start"
      align="flex-start"
      direction="column"
      wrap="wrap"
    >
      <Select
        searchable
        clearable
        withAsterisk
        size="lg"
        value={action}
        onChange={setAction}
        data={actions}
        label="Select a zone"
        placeholder="Pick one"
      />
      <NumberInput
        value={kph}
        onChange={(val) => setKph(val || 0)}
        label="Encounters/hr"
        withAsterisk
        hideControls
        min={0}
        precision={2}
      />
      {action && kph > 0 && (
        <CombatTable action={action} data={data} kph={kph} />
      )}
    </Flex>
  );
}
