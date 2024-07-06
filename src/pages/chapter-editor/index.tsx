import CustomHead from "@/components/Global/CustomHead";
import ChangeThemeButton from "@/components/UI/NavBar/ChangeThemeButton";
import { useChapterEditorStore } from "@/entities/chapter-editor";
import { ChapterType, StageType } from "@/shared/lib/type/chapter.type";
import { Box, Button, useColorMode } from "@chakra-ui/react";
import { DragEvent, MouseEvent, useCallback, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { useStageStore } from "@/entities/stage-editor";
import { AddStage, AddStageButton } from "@/features/chapter-editor";
import { logger } from "@/shared/lib/logger";
import { StageNode } from "@/shared/ui";
import { StageEditor } from "@/widgets/stage-editor";
import { TransferStageEditor } from "@/widgets/transfer-stage";

const nodeTypes = { stage: StageNode };

export const ChapterEditor = () => {
  const {
    setChapterId,
    setStoryId,
    chapter,
    setChapter,
    //
    nodes,
    edges,
    setNodes,
    setEdges,
    onEdgesChange,
    onNodesChange,

    reactFlowInstance,
    setReactFlowInstance,

    setParameters,
  } = useChapterEditorStore();

  const { setStage, setPoint, reset, setTransfer } = useStageStore();
  const { storyId, chapterId } = useParams();
  const { colorMode } = useColorMode();

  useEffect(() => {
    setChapterId(+(chapterId as string));
    setStoryId(+(storyId as string));

    const chapter = JSON.parse(
      localStorage.getItem(`story_${storyId}_chapter_${chapterId}`) as string
    ) as ChapterType;

    setChapter(chapter);
  }, []);

  useEffect(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const parameters: string[] = [];

    chapter?.stages.forEach((stage) => {
      const title = stage.title || "Переход на карту";

      const node: Node = {
        id: "stage_" + String(stage.id),
        type: "stage",
        data: {
          label: title,
          text: stage.texts?.length !== 0 ? stage.texts?.[0].text : "",
          stage: stage,
          type: stage.type_stage === 4 ? "OUTPUT" : undefined,
        },
        position: {
          x: stage.editor?.x || 0,
          y: stage.editor?.y || 0,
        },
      };
      nodes.push(node);

      stage.transfers?.forEach((transfer) => {
        const edge: Edge = {
          id: `${node.id}->${"stage_" + transfer.stage}`,
          data: {
            label: transfer.text,
          },
          source: node.id,
          target: `stage_${transfer.stage}`,
        };
        edges.push(edge);
      });

      Object.entries(stage.actions || {}).forEach(([operator, values]) => {
        if (operator !== "add") return;

        values.forEach((value) => {
          if (parameters.includes(value)) return;
          parameters.push(value);
        });
      });
    });

    Object.entries(chapter?.points || {}).forEach(([key, points]) => {
      points.forEach((point) => {
        const node: Node = {
          id: "point_" + String(point.id),
          type: "stage",
          data: {
            label: `Переход с карты ${key}`,
            point,
            mapId: key,
            type: "INPUT",
          },
          position: {
            x: point.editor?.x || 0,
            y: point.editor?.y || 0,
          },
        };
        const edge: Edge = {
          id: `${node.id}->${"stage_" + point?.data.stage}`,
          data: {
            label: `Переход на карту ${point.mapId}`,
          },
          source: node.id,
          target: `stage_${point.data.stage}`,
        };

        nodes.push(node);
        edges.push(edge);
      });
    });
    setNodes(nodes);
    setEdges(edges);

    logger.info("Finded parameters:", parameters);
    // set parameters
    setParameters(parameters);
    localStorage.setItem(
      `story_${storyId}_chapter_${chapterId}`,
      JSON.stringify(chapter)
    );
  }, [chapter]);

  const onNodeDragStop = () => {
    nodes.forEach((node) => {
      const [type, id] = node.id.split("_");
      switch (type) {
        case "stage":
          const targetStage = chapter?.stages.find((stage) => stage.id === +id);
          if (!targetStage) break;

          targetStage!.editor = {
            x: node.position.x,
            y: node.position.y,
          };
          break;
        case "point":
          const map: `${number}` = node.data.mapId;
          const point = chapter?.points![map].find((point) => point.id === id);
          if (!point) break;

          point!.editor = { x: node.position.x, y: node.position.y };

          break;
      }
    });

    localStorage.setItem(
      `story_${storyId}_chapter_${chapterId}`,
      JSON.stringify(chapter)
    );

    setChapter(chapter as ChapterType);
  };

  const onNodeClick = (_: MouseEvent, node: Node) => {
    reset();

    setTimeout(() => {
      const [type, id] = node.id.split("_");
      switch (type) {
        case "stage":
          const targetStage = chapter?.stages.find((stage) => stage.id === +id);
          if (!targetStage) break;
          logger.info("Select stage:", targetStage);
          setStage(JSON.parse(JSON.stringify(targetStage)));

          break;
        case "point":
          const map: `${number}` = node.data.mapId;
          const point = chapter?.points![map].find((point) => point.id === id);
          if (!point) break;

          setPoint(JSON.parse(JSON.stringify(point)));
          break;
      }
    }, 0);
  };

  const getNewStageId = useCallback(() => {
    let id = Math.max(...(chapter?.stages || []).map((c) => c.id)) + 1;
    if (id === -Infinity) id = 0;
    return id;
  }, [chapter]);

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const type = e.dataTransfer.getData("application/reactflow");
      if (typeof type === "undefined" || !type) {
        return;
      }

      logger.info("Drop", type);

      const position = reactFlowInstance?.project({
        x: e.clientX,
        y: e.clientY,
      });

      const copyChapter = JSON.parse(JSON.stringify(chapter)) as ChapterType;
      console.log(copyChapter.stages);

      switch (type as AddStage) {
        case "DEFAULT":
          const stage: StageType = {
            id: getNewStageId(),
            type_stage: 0,
            title: "Новая стадия",
            message: "",
            type_message: 0,
            background: "",
            texts: [
              {
                text: "Новый текст в новой стадии",
                condition: {},
              },
            ],
            transfers: [],
            actions: {},

            editor: position,
          };
          copyChapter.stages.push(stage);
          break;
        case "TO_MAP":
          const stageMap: StageType = {
            id: getNewStageId(),
            type_stage: 4,
            data: {
              map: "0",
              pos: "500:500",
            },
            editor: position,
          };
          copyChapter.stages.push(stageMap);
          break;
        case "ACTION":
          const actionStage: StageType = {
            id: getNewStageId(),
            type_stage: 5,
            actions: {},
            transfers: [],
            editor: position,
          };
          copyChapter.stages.push(actionStage);
          break;
        case "FROM_MAP":
          break;
      }

      setChapter(copyChapter);
    },
    [chapter, reactFlowInstance]
  );

  const onConnect = useCallback(
    (e: Connection) => {
      const copyChapter = JSON.parse(JSON.stringify(chapter)) as ChapterType;
      const [sourceType, sourceId] = e.source?.split("_") as string[];
      const [targetType, targetId] = e.target?.split("_") as string[];

      if (targetType !== "stage") return;

      if (sourceType === "stage") {
        const stage = copyChapter?.stages.find(
          (stage) => +stage.id === +sourceId
        );
        if (!stage) return;

        if (!stage.transfers) stage.transfers = [];
        stage.transfers.push({
          stage: +targetId,
          text: "Новый переход",
          condition: {},
        });
      }

      setChapter(copyChapter);
    },
    [chapter]
  );

  const onEdgeClick = (_: MouseEvent, e: Edge) => {
    const [sourceType, sourceId] = e.source.split("_");
    const targetId = +e.target.split("_")[1];

    if (sourceType === "stage") {
      const stage = chapter?.stages.find((s) => +s.id === +sourceId);
      if (!stage || !stage.transfers) return;
      const transfer = stage.transfers.find((t) => +t.stage === +targetId);
      if (!transfer) return;
      const stageIndex = chapter?.stages.indexOf(stage);
      if (stageIndex === undefined || stageIndex === -1) return;
      logger.info(`Open transfer in stage ${stageIndex}`);

      setTransfer({
        stageIndex,
        transferIndex: stage.transfers.indexOf(transfer),
        transfer: transfer,
      });
    } else {
    }
  };

  return (
    <>
      <CustomHead title={`Редактирование главы ${chapterId}`} />
      <Box>
        <Box
          display="flex"
          justifyContent="space-between"
          borderBottomWidth="1px"
          gap={1}
          p={1}
        >
          <Box display="flex" gap={1} alignItems="center">
            <Link to={`/edit/story/${storyId}`}>
              <Button size="sm">Назад</Button>
            </Link>
            <Link to={`/edit/story/${storyId}/maps/?prev_url=${location.pathname}`}>
            <Button size="sm">Карты</Button></Link>
          </Box>
          <Box>
            <ChangeThemeButton rounded={true} size="sm" />
          </Box>
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          borderBottomWidth="1px"
          gap={1}
          p={1}
          h="40px"
        >
          <AddStageButton />
        </Box>

        <Box height="calc(100vh - 82px)" width="100vw" position="relative">
          <StageEditor />
          <TransferStageEditor />

          <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            onEdgeClick={onEdgeClick}
            onNodeDragStop={() => onNodeDragStop()}
            onSelectionDragStop={() => onNodeDragStop()}
            onConnect={onConnect}
            onInit={setReactFlowInstance}
            onDragOver={onDragOver}
            onDrop={onDrop}
            minZoom={0.2}
            fitView
          >
            <Background
              style={{
                background: colorMode == "light" ? "#fafafa" : "#171923",
              }}
            />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </Box>
      </Box>
    </>
  );
};
