import axios from "axios";
import {
  ActionCategoryDetailMap,
  ActionDetailMap,
  ClientResponse,
  CombatMonsterDetailMap,
  ItemDetail,
} from "../models/Client";
import { MarketResponse, MarketValue } from "../models/Market";
import rawData from "../assets/init_client_info.json";

export interface ApiData {
  gameVersion: string;
  marketTime?: Date;
  levelExperienceTable: number[];
  itemDetails: { [key: string]: ItemDetail & MarketValue };
  actionDetails: { [key: string]: ActionDetailMap };
  combatMonsterDetails: { [key: string]: CombatMonsterDetailMap };
  actionTypeDetails: { [key: string]: ActionCategoryDetailMap };
  actionCategoryDetails: { [key: string]: ActionCategoryDetailMap };
  enhancementLevelSuccessRateTable: number[];
  enhancementLevelTotalBonusMultiplierTable: number[];
  skillDetails: { [key: string]: ActionCategoryDetailMap };
}

const getApiData = async (): Promise<ApiData> => {
  const marketData = await getMarketData();

  const clientData = rawData as ClientResponse;

  const itemDetails: { [key: string]: ItemDetail & MarketValue } = {};

  Object.entries(clientData.itemDetailMap).forEach(([key, value]) => {
    itemDetails[key] = {
      ...value,
      ...(marketData?.market?.[value.name] ?? {
        ask: -1,
        bid: -1,
        vendor: value.sellPrice,
      }),
    };
  });

  const result = {
    gameVersion: clientData.gameVersion,
    marketTime: marketData?.time ? new Date(marketData.time * 1000) : undefined,
    itemDetails,
    actionDetails: clientData.actionDetailMap,
    combatMonsterDetails: clientData.combatMonsterDetailMap,
    actionTypeDetails: clientData.actionTypeDetailMap,
    actionCategoryDetails: clientData.actionCategoryDetailMap,
    levelExperienceTable: clientData.levelExperienceTable,
    enhancementLevelSuccessRateTable:
      clientData.enhancementLevelSuccessRateTable,
    enhancementLevelTotalBonusMultiplierTable:
      clientData.enhancementLevelTotalBonusMultiplierTable,
    skillDetails: clientData.skillDetailMap,
  };

  return result;
};

export const getMarketData = (useMedian = false) => {
  return axios
    .get<MarketResponse>(
      `https://raw.githubusercontent.com/holychikenz/MWIApi/main/${
        useMedian ? "medianmarket" : "milkyapi"
      }.json`
    )
    .then((x) => x.data);
};

export default getApiData;
