import React, { useMemo } from "react";
import { Handle, Position } from "reactflow";
import { Badge, Box, SimpleGrid, Text } from "@chakra-ui/react";

type data = {
  label: string;
  onClick: () => void;
  text: string;
  actions: any;
};

export function NodeStage({
  data,
  isConnectable,
  selected,
}: {
  data: data;
  isConnectable: any;
  selected: boolean;
}) {
  const words = useMemo(() => data?.text, [data]);

  return (
    <Box
      p="10px"
      borderRadius={5}
      backgroundColor={selected ? "teal.200" : "white"}
      _dark={{
        color: "white",
        backgroundColor: selected ? "teal.500" : "gray.900",
      }}
      border={"1px solid"}
      borderColor="gray.800"
      color="black"
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <button onClick={() => data.onClick()}>
        <Text align="center">{data.label}</Text>
        <small>
          {words?.substr(0, 30)}
          {words?.length > 30 && "..."}
        </small>
        <Box display="grid" gap={1}>
          {Object.entries(data.actions).map((action: any, index: number) => {
            return (
              action[0] === "add" && (
                <SimpleGrid
                  columns={action[1].length > 1 ? 2 : 1}
                  gap={1}
                  key={index}
                >
                  {action[1].map((param: string) => (
                    <Badge colorScheme="green">{param}</Badge>
                  ))}
                </SimpleGrid>
              )
            );
          })}
        </Box>
      </button>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </Box>
  );
}
