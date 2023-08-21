export const saveDataString = JSON.stringify({
  skills: {
    milking: { level: 1, toolBonus: 0, teas: [] },
    foraging: { level: 1, toolBonus: 0, teas: [] },
    woodcutting: { level: 1, toolBonus: 0, teas: [] },
    cheesesmithing: { level: 1, toolBonus: 0, teas: [] },
    crafting: { level: 1, toolBonus: 0, teas: [] },
    tailoring: { level: 1, toolBonus: 0, teas: [] },
    cooking: { level: 1, toolBonus: 0, teas: [] },
    brewing: { level: 1, toolBonus: 0, teas: [] },
    enhancing: { level: 1, toolBonus: 0, teas: [] },
    combatLoot: { zone: "", encountersHr: 0 },
  },
});
export const saveDataObject = JSON.parse(
  '{"skills":{"milking":{"level":1,"toolBonus":0,"teas":[]},"foraging":{"level":1,"toolBonus":0,"teas":[]},"woodcutting":{"level":1,"toolBonus":0,"teas":[]},"cheesesmithing":{"level":1,"toolBonus":0,"teas":[]},"crafting":{"level":1,"toolBonus":0,"teas":[]},"tailoring":{"level":1,"toolBonus":0,"teas":[]},"cooking":{"level":1,"toolBonus":0,"teas":[]},"brewing":{"level":1,"toolBonus":0,"teas":[]},"enhancing":{"level":1,"toolBonus":0,"teas":[]},"combatLoot":{"zone":"","encountersHr":0}}}'
);
