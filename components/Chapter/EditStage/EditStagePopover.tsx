import React from "react";

import { Box, Button, Flex } from "@chakra-ui/react";
import { stageTypes } from "@/store/utils/stageName";
import MapStage from "@/components/Chapter/EditStage/MapStage";
import EditStage from "@/components/Chapter/EditStage/EditStage";
import EditActionsRefactor from "@/components/Chapter/EditStage/EditActions/EditActionsRefactor";
import { stageType } from "@/store/types/types";
import {
  editActions,
  setStageToStore,
  setTransition,
} from "@/store/reduxStore/stageSlice";
import FromMapStage from "@/components/Chapter/EditStage/FromMapStage";
import { useAppDispatch, useAppSelector } from "@/store/reduxHooks";
import EditMission from "../EditMission/EditMission";

interface IProps {
  editableStage: stageType | undefined;
  updateStage: (stageId: number) => void;
  deleteStage: (stageId: number) => void;
  deletePoint: () => void;
  setEditableStage: (stage: stageType | undefined) => void;
  updateTransitionFromMap: () => void;
}

const EditStagePopover = ({
  editableStage,
  updateStage,
  deleteStage,
  deletePoint,
  setEditableStage,
  updateTransitionFromMap,
}: IProps) => {
  const storeStage = useAppSelector((state) => state.stage.stage);
  const transitionFromMap = useAppSelector(
    (state) => state.stage.transitionFromMap
  );
  const dispatch = useAppDispatch();

  return (
    <>
      {editableStage && (
        <Box
          zIndex="1"
          p={5}
          w={450}
          borderLeft="2px"
          borderColor="gray.200"
          backgroundColor="white"
          _dark={{
            backgroundColor: "gray.900",
            color: "white",
            borderColor: "gray.900",
          }}
          position="absolute"
          right="0"
          bottom="0"
        >
          {/* Панель редактирования */}
          <Box h="calc(100vh - 171px)" overflowY="scroll">
            {transitionFromMap && <FromMapStage />}
            {stageTypes(storeStage?.type_stage) === "map" && (
              <MapStage data={storeStage?.data} />
            )}
            {stageTypes(storeStage?.type_stage) === "default" && <EditStage />}
            {storeStage?.actions && (
              <EditActionsRefactor
                actions={storeStage?.actions}
                onChangeActions={editActions}
              />
            )}
            {stageTypes(storeStage?.type_stage) === "default" && (
              <EditMission />
            )}
          </Box>
          <Flex>
            <Button
              colorScheme="teal"
              size="md"
              mt={2}
              me={2}
              onClick={() => {
                if (!transitionFromMap) {
                  updateStage(storeStage?.id);
                } else {
                  updateTransitionFromMap();
                }
                setEditableStage(undefined);
              }}
            >
              Сохранить
            </Button>
            <Button
              size="md"
              mt={2}
              colorScheme="teal"
              onClick={() => {
                dispatch(setStageToStore(null));
                dispatch(setTransition(null));
                setEditableStage(undefined);
              }}
            >
              Закрыть
            </Button>
            <Box m="auto" />
            <Button
              colorScheme="red"
              size="md"
              mt={2}
              onClick={() => {
                if (!transitionFromMap) {
                  deleteStage(storeStage?.id);
                } else {
                  deletePoint();
                }
              }}
            >
              Удалить
            </Button>
          </Flex>
        </Box>
      )}
    </>
  );
};

export default EditStagePopover;
