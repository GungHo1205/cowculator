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
  Title,
  rem,
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
  const { data, isLoading } = useQuery({
    queryKey: ["marketData", marketMode],
    queryFn: () => getMarketData(marketMode),
    refetchInterval: 30 * 60 * 1000,
  });
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
        <Title
          order={2}
          style={{ fontSize: rem(34), fontWeight: 900 }}
          ta="center"
          mt="sm"
        >
          Choose between Median (24-hour median) and Milky (current market info
          )
        </Title>
      </div>
      <Flex
        justify="flex-start"
        align="center"
        direction="row"
        wrap="wrap"
        gap="xs"
      >
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
            {
              value: "median",
              label: "Median",
            },
            { value: "milky", label: "Milky" },
          ]}
          defaultValue={"median"}
          label="Select a market mode"
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
