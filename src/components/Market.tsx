import { useQuery } from "@tanstack/react-query";
import { getMarketData } from "../services/ApiService";
import {
  Code,
  Flex,
  Loader,
  Select,
  Space,
  Table,
  TextInput,
} from "@mantine/core";
import { useMemo, useState } from "react";
interface Props {
  onMarketModeChange: (marketMode: "median" | "milky") => void;
  marketMode: boolean;
}
export default function Market({
  onMarketModeChange,
  marketMode = false,
}: Props) {
  const [search, setSearch] = useState("");
  // console.log(getMarketData(marketMode));
  const { data, isLoading } = useQuery({
    queryKey: ["marketData", marketMode],
    queryFn: () => getMarketData(marketMode),
    refetchInterval: 30 * 60 * 1000,
  });
  // console.log(data);
  // console.log(data?.market);
  const items = useMemo(
    () =>
      data &&
      Object.entries(data.market)
        .filter(
          ([key]) => !search || key.toLowerCase().includes(search.toLowerCase())
        )
        .sort(([, a], [, b]) => {
          if (a.bid > b.bid) return -1;
          if (a.bid < b.bid) return 1;
          return 0;
        })
        .map(([key, val]) => {
          return (
            <tr key={key}>
              <td>{key}</td>
              <td>{val.ask}</td>
              <td>{val.bid}</td>
            </tr>
          );
        }),
    [data, search]
  );

  if (isLoading || !data) return <Loader />;

  return (
    <>
      <div>
        Market Date: <Code>{new Date(data.time * 1000).toLocaleString()}</Code>
      </div>
      <Flex>
        <TextInput
          placeholder="Holy Brush"
          label="Search"
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />
        <Select
          searchable
          size="lg"
          onChange={onMarketModeChange}
          data={[
            { value: "median", label: "median" },
            { value: "milky", label: "milky" },
          ]}
          label="Select an item"
          placeholder="Pick one"
        />
      </Flex>
      <Space h="md" />

      <Flex
        gap="sm"
        justify="flex-start"
        align="flex-start"
        wrap="wrap"
        direction="row"
      >
        <Flex direction="column">
          <Table striped highlightOnHover withBorder withColumnBorders>
            <thead>
              <tr>
                <th>Item</th>
                <th>Ask</th>
                <th>Bid</th>
              </tr>
            </thead>
            <tbody>{items}</tbody>
          </Table>
        </Flex>
      </Flex>
    </>
  );
}
