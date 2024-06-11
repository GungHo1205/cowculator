import {
  AppShell,
  Code,
  Container,
  Flex,
  Footer,
  Loader,
  Tabs,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import getApiData from "./services/ApiService";
import { ActionType } from "./models/Client";
import Market from "./components/Market";
import ActionCategorySelector from "./components/ActionCategorySelector";
import { Suspense, lazy, useState } from "react";
import { Skill } from "./helpers/CommonFunctions";
import { CombatData, SaveDataObject, SkillBonuses } from "./helpers/Types";
import { saveDataObject, saveDataString } from "./helpers/Constants";

const ItemLookup = lazy(() => import("./components/ItemLookup"));
const Enhancing = lazy(() => import("./components/Enhancing"));
const Gathering = lazy(() => import("./components/Gathering"));
const Calculator = lazy(() => import("./components/Calculator"));
const Combat = lazy(() => import("./components/Combat"));
const Character = lazy(() => import("./components/Character"));

export default function App() {
  const [marketMode, setMarketMode] = useState<boolean>(false);

  const { data, isLoading } = useQuery({
    queryKey: ["apiData", marketMode],
    queryFn: () => getApiData(marketMode),
    refetchInterval: 5 * 60 * 1000,
  });
  const onMarketModeChange = (marketMode: "median" | "milky") => {
    if (marketMode === "median") setMarketMode(true);
    else setMarketMode(false);
  };
  const onSkillBonusesChange = (skill: Skill, bonuses: SkillBonuses) => {
    switch (skill) {
      case "milking":
        saveDataObject["skills"].milking.bonuses = bonuses.bonuses;
        saveDataObject["skills"].milking.itemBonuses = bonuses.itemBonuses;
        localStorage.setItem("saveDataObject", JSON.stringify(saveDataObject));
        return;
      case "foraging":
        saveDataObject["skills"].foraging.bonuses = bonuses.bonuses;
        saveDataObject["skills"].foraging.itemBonuses = bonuses.itemBonuses;
        localStorage.setItem("saveDataObject", JSON.stringify(saveDataObject));

        return;
      case "woodcutting":
        saveDataObject["skills"].woodcutting.bonuses = bonuses.bonuses;
        saveDataObject["skills"].woodcutting.itemBonuses = bonuses.itemBonuses;
        localStorage.setItem("saveDataObject", JSON.stringify(saveDataObject));

        return;
      case "cheesesmithing":
        saveDataObject["skills"].cheesesmithing.bonuses = bonuses.bonuses;
        saveDataObject["skills"].cheesesmithing.itemBonuses =
          bonuses.itemBonuses;
        localStorage.setItem("saveDataObject", JSON.stringify(saveDataObject));

        return;
      case "crafting":
        saveDataObject["skills"].crafting.bonuses = bonuses.bonuses;
        saveDataObject["skills"].crafting.itemBonuses = bonuses.itemBonuses;
        localStorage.setItem("saveDataObject", JSON.stringify(saveDataObject));

        return;
      case "tailoring":
        saveDataObject["skills"].tailoring.bonuses = bonuses.bonuses;
        saveDataObject["skills"].tailoring.itemBonuses = bonuses.itemBonuses;
        localStorage.setItem("saveDataObject", JSON.stringify(saveDataObject));

        return;
      case "cooking":
        saveDataObject["skills"].cooking.bonuses = bonuses.bonuses;
        saveDataObject["skills"].cooking.itemBonuses = bonuses.itemBonuses;
        localStorage.setItem("saveDataObject", JSON.stringify(saveDataObject));

        return;
      case "brewing":
        saveDataObject["skills"].brewing.bonuses = bonuses.bonuses;
        saveDataObject["skills"].brewing.itemBonuses = bonuses.itemBonuses;
        localStorage.setItem("saveDataObject", JSON.stringify(saveDataObject));

        return;
      case "enhancing":
        saveDataObject["skills"].enhancing.bonuses = bonuses.bonuses;
        saveDataObject["skills"].enhancing.item = bonuses.item;
        saveDataObject["skills"].enhancing.itemBonuses = bonuses.itemBonuses;
        localStorage.setItem("saveDataObject", JSON.stringify(saveDataObject));
        return;
    }
  };
  const onCombatSkillChange = (type: string, bonuses: CombatData) => {
    switch (type) {
      case "loot":
        saveDataObject["skills"].combatLoot.data = bonuses.data;
        localStorage.setItem("saveDataObject", JSON.stringify(saveDataObject));
        return;
      case "level":
        saveDataObject["skills"].combatLevel = bonuses;
        localStorage.setItem("saveDataObject", JSON.stringify(saveDataObject));
        return;
    }
  };
  const loadedSaveData: SaveDataObject = JSON.parse(
    localStorage.getItem("saveDataObject") || saveDataString
  );
  if (isLoading || !data) return <Loader />;
  return (
    <AppShell
      padding="md"
      footer={
        <Footer
          height={{
            base: 65,
            sm: 25,
          }}
        >
          <Flex
            gap="xs"
            justify="center"
            align="flex-start"
            direction="row"
            wrap="wrap"
          >
            <div>
              Game Version: <Code>{data.gameVersion}</Code>
            </div>
            <div>
              Market Date:{" "}
              <Code>
                {data.marketTime ? data.marketTime.toLocaleString() : "No data"}
              </Code>
            </div>
          </Flex>
        </Footer>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      <Container fluid>
        <Suspense fallback={<Loader />}>
          <Tabs variant="outline" defaultValue="production">
            <Tabs.List>
              {/* <Tabs.Tab value="character">Character</Tabs.Tab> */}
              <Tabs.Tab value="production">Production</Tabs.Tab>
              <Tabs.Tab value="itemLookup">Item Lookup</Tabs.Tab>
              <Tabs.Tab value="milking">Milking</Tabs.Tab>
              <Tabs.Tab value="foraging">Foraging</Tabs.Tab>
              <Tabs.Tab value="woodcutting">Woodcutting</Tabs.Tab>
              <Tabs.Tab value="cheesesmithing">Cheesesmithing</Tabs.Tab>
              <Tabs.Tab value="crafting">Crafting</Tabs.Tab>
              <Tabs.Tab value="tailoring">Tailoring</Tabs.Tab>
              <Tabs.Tab value="cooking">Cooking</Tabs.Tab>
              <Tabs.Tab value="brewing">Brewing</Tabs.Tab>
              <Tabs.Tab value="enhancing">Enhancing</Tabs.Tab>
              <Tabs.Tab value="combatLoot">Combat Loot</Tabs.Tab>
              <Tabs.Tab value="combatLevel">Combat Level(WIP)</Tabs.Tab>
              <Tabs.Tab value="market">Market</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="character" pt="xs">
              <Character data={data} />
            </Tabs.Panel>

            <Tabs.Panel value="production" pt="xs">
              <Calculator data={data} />
            </Tabs.Panel>

            <Tabs.Panel value="itemLookup" pt="xs">
              <ItemLookup data={data} />
            </Tabs.Panel>

            <Tabs.Panel value="milking" pt="xs">
              <Gathering
                skill={Skill.Milking}
                type={ActionType.Milking}
                data={data}
                loadedSaveData={loadedSaveData}
                onSkillBonusesChange={onSkillBonusesChange}
              />
            </Tabs.Panel>

            <Tabs.Panel value="foraging" pt="xs">
              <Gathering
                skill={Skill.Foraging}
                type={ActionType.Foraging}
                data={data}
                loadedSaveData={loadedSaveData}
                onSkillBonusesChange={onSkillBonusesChange}
              />
            </Tabs.Panel>

            <Tabs.Panel value="woodcutting" pt="xs">
              <Gathering
                skill={Skill.Woodcutting}
                type={ActionType.Woodcutting}
                data={data}
                loadedSaveData={loadedSaveData}
                onSkillBonusesChange={onSkillBonusesChange}
              />
            </Tabs.Panel>

            <Tabs.Panel value="cheesesmithing" pt="xs">
              <ActionCategorySelector
                skill={Skill.Cheesesmithing}
                data={data}
                loadedSaveData={loadedSaveData}
                onSkillBonusesChange={onSkillBonusesChange}
              />
            </Tabs.Panel>

            <Tabs.Panel value="crafting" pt="xs">
              <ActionCategorySelector
                skill={Skill.Crafting}
                data={data}
                loadedSaveData={loadedSaveData}
                onSkillBonusesChange={onSkillBonusesChange}
              />
            </Tabs.Panel>

            <Tabs.Panel value="tailoring" pt="xs">
              <ActionCategorySelector
                skill={Skill.Tailoring}
                data={data}
                loadedSaveData={loadedSaveData}
                onSkillBonusesChange={onSkillBonusesChange}
              />
            </Tabs.Panel>

            <Tabs.Panel value="cooking" pt="xs">
              <ActionCategorySelector
                skill={Skill.Cooking}
                data={data}
                loadedSaveData={loadedSaveData}
                onSkillBonusesChange={onSkillBonusesChange}
              />
            </Tabs.Panel>

            <Tabs.Panel value="brewing" pt="xs">
              <ActionCategorySelector
                skill={Skill.Brewing}
                data={data}
                loadedSaveData={loadedSaveData}
                onSkillBonusesChange={onSkillBonusesChange}
              />
            </Tabs.Panel>

            <Tabs.Panel value="enhancing" pt="xs">
              <Enhancing
                data={data}
                loadedSaveData={loadedSaveData}
                onSkillBonusesChange={onSkillBonusesChange}
              />
            </Tabs.Panel>

            <Tabs.Panel value="combatLoot" pt="xs">
              <Combat
                data={data}
                loadedSaveData={loadedSaveData}
                onCombatSkillChange={onCombatSkillChange}
              />
            </Tabs.Panel>
            {/* <Tabs.Panel value="combatLevel" pt="xs">
              <CombatLevel
                data={data}
                loadedSaveData={loadedSaveData}
                onCombatSkillChange={onCombatSkillChange}
              />
            </Tabs.Panel> */}

            <Tabs.Panel value="market" pt="xs">
              <Market
                onMarketModeChange={onMarketModeChange}
                marketMode={marketMode}
              />
            </Tabs.Panel>
            {/* <Tabs.Panel value="houses" pt="xs">
              <Market
                onMarketModeChange={onMarketModeChange}
                marketMode={marketMode}
              />
            </Tabs.Panel> */}
          </Tabs>
        </Suspense>
      </Container>
    </AppShell>
  );
}
