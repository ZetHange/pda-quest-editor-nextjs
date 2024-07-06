import { FC } from "react";
import type { MapType } from "@/shared/lib/type/map.type";
import { Box, Button, Card, CardBody, CardFooter, CardHeader, Heading } from "@chakra-ui/react";
import { useMapsStore } from "../maps.store";

interface MapCardProps {
  map: MapType;
  storyId: number;
}

export const MapCard: FC<MapCardProps> = ({ map, storyId }) => {
  const { deleteMap } = useMapsStore();
  
  const onDelete = () => {
    localStorage.removeItem(`story_${storyId}_maps_${map.id}`);
    deleteMap(map.id);
  }

  return (
    <Card size="sm">
      <CardHeader>
        <Heading fontSize="medium">{map.title}</Heading>
      </CardHeader>
      <CardBody>
        <Box>ID: {map.id}</Box>
        <Box>- {map.points?.length} точек</Box>
        <Box>- {map.spawns?.length} отрядов</Box>
      </CardBody>
      <CardFooter display="flex" gap={1}>
        <Button size="sm">Редактировать</Button>
        <Button size="sm" colorScheme="red" onClick={onDelete}>Удалить</Button>
      </CardFooter>      
    </Card>
  );
};
