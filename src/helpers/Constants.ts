export const saveDataString = JSON.stringify({
  skills: {
    milking: { bonuses: { level: 1, toolBonus: 0, teas: [] } },
    foraging: { bonuses: { level: 1, toolBonus: 0, teas: [] } },
    woodcutting: { bonuses: { level: 1, toolBonus: 0, teas: [] } },
    cheesesmithing: {
      bonuses: {
        level: 1,
        toolBonus: 0,
        teas: [],
        experience: "",
        targetLevel: "",
      },
    },
    crafting: {
      bonuses: {
        level: 1,
        toolBonus: 0,
        teas: [],
        experience: "",
        targetLevel: "",
      },
    },
    tailoring: {
      bonuses: {
        level: 1,
        toolBonus: 0,
        teas: [],
        experience: "",
        targetLevel: "",
      },
    },
    cooking: {
      bonuses: {
        level: 1,
        toolBonus: 0,
        teas: [],
        experience: "",
        targetLevel: "",
      },
    },
    brewing: {
      bonuses: {
        level: 1,
        toolBonus: 0,
        teas: [],
        experience: "",
        targetLevel: "",
      },
    },
    enhancing: {
      bonuses: {
        level: 1,
        toolBonus: 0,
        teas: [],
      },
      item: { item: null, target: 1 },
    },
    combatLoot: { data: { zone: "", encountersHr: 0 } },
    combatLevel: {
      data: { zone: "", encountersHr: 0 },
      bonuses: {
        level: "",
        experience: "",
        targetlevel: "",
        withWisdomCoffee: false,
        withNecklaceOfWisdom: false,
        enhancementLevel: 0,
      },
    },
  },
});
export const saveDataObject = JSON.parse(
  '{"skills":{"milking":{"bonuses":{"level":1,"toolBonus":0,"teas":[]}},"foraging":{"bonuses":{"level":1,"toolBonus":0,"teas":[]}},"woodcutting":{"bonuses":{"level":1,"toolBonus":0,"teas":[]}},"cheesesmithing":{"bonuses":{"level":1,"toolBonus":0,"teas":[],"experience":"","targetLevel":""}},"crafting":{"bonuses":{"level":1,"toolBonus":0,"teas":[],"experience":"","targetLevel":""}},"tailoring":{"bonuses":{"level":1,"toolBonus":0,"teas":[],"experience":"","targetLevel":""}},"cooking":{"bonuses":{"level":1,"toolBonus":0,"teas":[],"experience":"","targetLevel":""}},"brewing":{"bonuses":{"level":1,"toolBonus":0,"teas":[],"experience":"","targetLevel":""}},"enhancing":{"bonuses":{"level":1,"toolBonus":0,"teas":[]},"item":{"item":null,"target":1}},"combatLoot":{"data":{"zone":"","encountersHr":0}},"combatLevel":{"data":{"zone":"","encountersHr":0},"bonuses":{"level":"","experience":"","targetlevel":"","withWisdomCoffee":false,"withNecklaceOfWisdom":false,"enhancementLevel":0}}}}'
);
