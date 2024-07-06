import { Box, Button, Input, VStack } from "@chakra-ui/react";
import { FC, useState } from "react";

export interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  parameters: string[];
}

const AutocompleteInput: FC<AutocompleteInputProps> = ({
  value,
  onChange,
  parameters,
}) => {
  const [show, setShow] = useState<boolean>(false);

  return (
    <Box position="relative" w="100%">
      <Input
        bg="white"
        _dark={{
          bg: "gray.700",
          color: "gray.200",
        }}
        value={value}
        onChange={({ target: { value } }) => onChange(value)}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 100)}
      />
      {show &&
        parameters.filter((param) => param.includes(value)).length !== 0 && (
          <VStack
            position="absolute"
            zIndex={100}
            bg="white"
            border="1px"
            borderColor="gray.100"
            rounded="md"
            p={1}
            mt={1}
            gap={1}
          >
            {parameters
              .filter((param) => param.includes(value))
              .map((param, index) => (
                <Button
                  size="sm"
                  // variant="ghost"
                  w="100%"
                  key={index}
                  onClick={() => {
                    onChange(param);
                    setShow(false);
                  }}
                >
                  {param}
                </Button>
              ))}
          </VStack>
        )}
    </Box>
  );
};

export { AutocompleteInput };
