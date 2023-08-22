export type NecklaceOfWisdom = {
  withNecklaceOfWisdom: boolean;
  enhancementLevel: number;
};
// export type SkillBonuses = Omit<
//   ProductionSkillBonuses,
//   "experience" | "targetLevel"
// >;
export type SkillBonuses = {
  bonuses: {
    level: number | "";
    toolBonus: number | "";
    teas: string[];
    experience?: number | "";
    targetLevel?: number | "";
  };
  item?: {
    item: string | null;
    target: number;
  };
};
export type CombatData = {
  data: {
    zone: string | null;
    encountersHr: number;
  };
  bonuses?: {
    level: number | "";
    experience: number | "";
    targetLevel: number | "";
    withWisdomCoffee: boolean;
    withNecklaceOfWisdom: boolean;
    enhancementLevel: number;
  };
};

export interface SaveDataObject {
  skills: {
    milking: SkillBonuses;
    foraging: SkillBonuses;
    woodcutting: SkillBonuses;
    cheesesmithing: SkillBonuses;
    crafting: SkillBonuses;
    tailoring: SkillBonuses;
    cooking: SkillBonuses;
    brewing: SkillBonuses;
    enhancing: SkillBonuses;
    combatLoot: CombatData;
    combatLevel: CombatData;
  };
}
