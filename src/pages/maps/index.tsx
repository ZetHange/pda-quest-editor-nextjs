import ChangeThemeButton from "@/components/UI/NavBar/ChangeThemeButton";
import { MapCard, useMapsStore } from "@/entities/maps";
import { Box, Button } from "@chakra-ui/react";
import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";

export const MapsEditor = () => {
  const { storyId } = useParams();
  
  const { maps, getMapsByStoryId } = useMapsStore();

  useEffect(() => {
    getMapsByStoryId(Number(storyId));
  }, [])

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        borderBottomWidth="1px"
        gap={1}
        p={1}
      >
        <Box display="flex" gap={1} alignItems="center">
          <Link to={new URL(location.href).searchParams.get("prev_url") ?? "/"}>
            <Button size="sm">Назад</Button>
          </Link>
        </Box>
        <Box>
          <ChangeThemeButton rounded={true} size="sm" />
        </Box>
      </Box>
      <Box h="calc(100vh - 73px)" p={1} overflowY="auto">
        <Box overflowY="auto">
          {maps.map((map) => (
            <MapCard key={map.id} storyId={+storyId!} map={map} />
          ))}
        </Box>
      </Box>
    </Box>
  );
};
