import useKeydown from "@buildinams/use-keydown";
import dagre from "dagre";
import querystring from "querystring";
import {
  DragEventHandler,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import store from "store2";
import { v4 as uuidv4, validate as uuidValidate } from "uuid";

import ReactFlow, {
  applyNodeChanges,
  Background,
  Controls,
  Edge,
  MarkerType,
  MiniMap,
  Node,
  Position,
  ReactFlowInstance,
  ReactFlowProvider,
} from "reactflow";

import {
  Box,
  Button,
  Spacer,
  Text,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";

import CreateStage from "@/components/Chapter/CreateStage";
import CreateTransferModal from "@/components/Chapter/EditStage/CreateTransfer/CreateTransferModal";
import EditStagePopover from "@/components/Chapter/EditStage/EditStagePopover";
import EditTransferModal from "@/components/Chapter/EditStage/EditTransferModal";
import EditTransitionModal from "@/components/Chapter/EditStage/EditTransitionModal";
import MovingStagesModal from "@/components/Chapter/MovingStagesModal";
import ToStage from "@/components/Chapter/ToStage";
import UtilitiesDrawer from "@/components/Chapter/UtilitiesDrawer";
import CustomHead from "@/components/Global/CustomHead";
import NodeStage from "@/components/Global/StageNode";
import TransferEdge from "@/components/Global/TransferEdge";
import { logger } from "@/shared/lib/logger.ts";
import reduxStore, { RootState } from "@/store/reduxStore";
import { useAppDispatch, useAppSelector } from "@/store/reduxStore/reduxHooks";
import { setMaps } from "@/store/reduxStore/slices/chapterMapsSlice";
import { setMissions } from "@/store/reduxStore/slices/missionSlice";
import {
  setConnection,
  setParameters,
  setStageToStore as setStageToRedux,
  setTargetTransfer,
  setTransition,
  setTransitionToStore,
} from "@/store/reduxStore/slices/stageSlice";
import { newStage } from "@/store/tools/createTools";
import { nodeCreateType } from "@/store/types/nodeCreateType";
import {
  chapterType,
  stageTransfer,
  stageType,
} from "@/store/types/story/chapterType";
import { mapType, pointType, typePoints } from "@/store/types/story/mapType";
import { stageName } from "@/store/utils/stageName";
import { useStore } from "react-redux";
import "reactflow/dist/style.css";
import { Store } from "redux";

export default function StageEditScreen({
  path,
  isReady,
  query,
}: {
  path: string[];
  query: querystring.ParsedUrlQuery;
  isReady: boolean;
}) {
  const [chapter, setChapter] = useState<chapterType>();
  const maps: mapType[] = useAppSelector((state) => state.maps.maps);

  const { colorMode } = useColorMode();
  const dispatch = useAppDispatch();
  const storeStage = useAppSelector((state) => state.stage.stage);

  const [nodes, setNodes] = useState<Node[]>();
  const [edges, setEdges] = useState<Edge[]>();

  const [editableStage, setEditableStage] = useState<stageType>();

  const [isOpenCreateTransfer, setIsOpenCreateTransfer] =
    useState<boolean>(false);

  const [showModalEditTransfer, setShowModalEditTransfer] =
    useState<boolean>(false);
  const [showModalEditTransition, setShowModalEditTransition] =
    useState<boolean>(false);

  // для dnd
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance>();

  // @ts-ignore
  const storeRedux: Store<RootState> = useStore();

  const {
    onOpen: onOpenLogs,
    isOpen: isOpenLogs,
    onClose: onCloseLogs,
  } = useDisclosure();
  const settings = useAppSelector((state) => state.user.settings);

  // вытаскивание карт
  useEffect(() => {
    store.each((key, value) => {
      if (
        key.includes(`story_${path[0]}_map`) &&
        !maps.find((map) => +map.id === +value.id)
      ) {
        dispatch(setMaps(value));
      }
      if (key === "stopLoop") return false;
    });
  }, [isReady]);

  // Вытаскивание главы из localStorage
  useEffect(() => {
    const chapterFromLocalStorage =
      path[0] && store.get(`story_${path[0]}_chapter_${path[1]}`);

    setChapter(chapterFromLocalStorage);
  }, [isReady]);

  const updateChapter = (chapter: any, all: boolean) => {
    if (all) setChapter(chapter);

    if (path[0]) {
      store.set(`story_${path[0]}_chapter_${path[1]}`, chapter, true);
    }
  };

  const getLayoutedElements = (
    nodes: Node[],
    edges: Edge[],
    direction = "TB"
  ) => {
    const dagreGraph = new dagre.graphlib.Graph();
    dagreGraph.setDefaultEdgeLabel(() => ({}));
    const nodeWidth = +settings.nodeWidth;
    const nodeHeight = +settings.nodeHeight;

    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node: Node) => {
      dagreGraph.setNode(node.id, {
        width: nodeWidth,
        height: nodeHeight,
      });
    });

    edges.forEach((edge: Edge) => {
      dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node: Node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      node.targetPosition = isHorizontal ? Position.Left : Position.Top;
      node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

      node.position = {
        x: nodeWithPosition.x,
        y: nodeWithPosition.y,
      };

      return node;
    });

    return {
      nodes,
      edges,
    };
  };

  const onLayout = useCallback(
    (direction: "TB" | "LR") => {
      const { nodes: layoutedNodes } = getLayoutedElements(
        nodes!,
        edges!,
        direction
      );
      logger.info({ nodes, edges });

      const copyChapter = store.get(`story_${path[0]}_chapter_${path[1]}`);
      const points = Object.values(copyChapter?.points!).flat() as pointType[];
      layoutedNodes.forEach((node) => {
        const stage = copyChapter.stages.find(
          (stage: stageType) => stage.id === +node.id
        );
        const point = points.find((point) => point.id === node.id);
        if (stage) {
          stage.editor = {
            x: node.position.x,
            y: node.position.y,
          };
        }
        if (point) {
          point.editor = {
            x: node.position.x,
            y: node.position.y,
          };
        }
      });

      // setNodes(layoutedNodes);
      // setEdges(layoutedEdges);
      updateChapter(copyChapter, true);
    },
    [nodes, edges]
  );

  // set id for points
  useEffect(() => {
    if (
      path[0] &&
      store.get(`story_${path[0]}_chapter_${path[1]}`) &&
      chapter?.points
    ) {
      const chapter = store.get(
        `story_${path[0]}_chapter_${path[1]}`
      ) as chapterType;

      const points = chapter?.points;
      const pointsValues = Object.values(points!);

      pointsValues.map((pointsGroup) => {
        pointsGroup.forEach((item) => {
          if (!item.id) {
            item.id = uuidv4();
          }
        });
      });
      const updatedChapter = {
        ...chapter,
        points,
      };
      updateChapter(updatedChapter, true);
    }
  }, [isReady]);

  interface CustomNode extends Node {
    position: {
      x: number;
      y: number;
    };
  }

  useEffect(() => {
    const initialNodes: CustomNode[] = [];
    const initialEdges: any[] = [];

    chapter?.stages?.map((stage: stageType) => {
      initialNodes.push({
        id: String(stage.id),
        type: "nodeStage",
        selected: stage.id === storeStage?.id,
        data: {
          label: stageName(stage.type_stage, stage, maps)
            ? stageName(stage.type_stage, stage, maps)
            : stage.title,
          onClick: () => {
            dispatch(setStageToRedux(null));
            dispatch(setTransition(null));
            setEditableStage(undefined);
            setTimeout(() => {
              dispatch(setStageToRedux(stage));
              setEditableStage(stage);
            }, 0);
          },
          text: stage.texts && stage.texts[0].text,
          stage: stage,
        },
        position: stage.editor
          ? {
              x: stage.editor.x as number,
              y: stage.editor.y as number,
            }
          : {
              x: 0,
              y: 0,
            },
      });
    });

    // отрисовка переходов
    chapter?.stages?.map((stage: stageType): void => {
      stage?.transfers?.map((transfer: stageTransfer): void => {
        initialEdges.push({
          id: `${stage.id}@${transfer.stage}`,
          source: String(stage.id),
          target: String(transfer.stage),
          type: "custom",
          data: {
            label: transfer.text.substring(0, 30),
            transfer,
            onClick: onEdgesClick,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
        });
      });
    });

    // отрисовка точек
    if (chapter?.points) {
      Object.entries(chapter?.points).map((points) => {
        points[1].map((point) => {
          const stage = {
            id: point.id,
            mapId: points[0],
            type_stage: 777,
            originalPoint: {
              point,
              mapId: points[0],
            },
            point: {
              id: point.id,
              ...point,
            },
          };
          initialNodes.push({
            id: String(point.id),
            type: "nodeStage",
            selected: false,
            data: {
              label:
                "Переход с локации " +
                '"' +
                maps.find((map) => +map.id === +points[0])?.title +
                '"',
              text:
                typePoints.find((type) => +type[0] === +point.type)![1] +
                ": " +
                point.name,
              onClick: () => {
                dispatch(setTransition(null));
                dispatch(setStageToRedux(null));
                setEditableStage(undefined);
                setTimeout(() => {
                  dispatch(setTransition(stage));
                  setEditableStage(stage as unknown as stageType);
                }, 0);
              },
              point,
            },
            position: point.editor
              ? {
                  x: point.editor.x as number,
                  y: point.editor.y as number,
                }
              : {
                  x: 0,
                  y: 0,
                },
          });
          if (point.data.stage !== "" && +point.data.chapter === +path[1]) {
            initialEdges.push({
              id: `${point.id}@${point.data.stage}`,
              source: String(point.id),
              target: String(point.data.stage),
              type: "custom",
              data: {
                onClick: () => {},
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
              },
            });
          }
        });
      });
    }

    const parameters: string[] = [];
    chapter?.stages?.forEach((stage: stageType) => {
      if (stage.actions && stage.actions.add) {
        stage.actions.add.forEach((item) => {
          if (isNaN(Number(item.split(":")[0]))) {
            if (parameters.findIndex((parameter) => parameter === item) === -1)
              parameters.push(item);
          }
        });
      }
    });
    dispatch(setParameters(parameters));
    if (chapter?.mission) {
      if (!Array.isArray(chapter.mission)) {
        chapter.missions = [];
      } else {
        chapter.missions = chapter.mission;
      }
      delete chapter.mission;
      updateChapter(chapter, true);
    }

    if (chapter?.missions) {
      dispatch(setMissions(chapter.missions));
    }

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [chapter]);

  // передвижение node
  const onNodesChange = useCallback(
    (changes: any[]): void => {
      setNodes((nds: any) => applyNodeChanges(changes, nds));

      changes.forEach((change: any) => {
        if (change.position) {
          if (uuidValidate(change.id)) {
            const points: {
              [key: `${number}`]: pointType[];
            } = chapter?.points as {
              [key: `${number}`]: pointType[];
            };

            const pointsValues: pointType[] = Object.values(points).flat();
            pointsValues.forEach((point) => {
              if (
                (point && point.id === change.id,
                Object.getOwnPropertyDescriptor(point, "point")?.writable)
              ) {
                point.editor = {
                  x: change.position.x,
                  y: change.position.y,
                };
              }
            });
            const updatedChapter = {
              ...chapter,
              points,
            };
            updateChapter(updatedChapter, false);
          } else {
            const idStage = chapter?.stages?.findIndex(
              (stage) => +stage.id === +change.id
            ) as number;
            const updatedStageWithPosition = {
              ...chapter?.stages[idStage],
              editor: {
                x: change.position.x,
                y: change.position.y,
              },
            };

            const initialChapter =
              path[0] && store.get(`story_${path[0]}_chapter_${path[1]}`);

            initialChapter.stages?.splice(idStage, 1, updatedStageWithPosition);

            updateChapter(initialChapter, false);
          }
        }
      });
    },
    [chapter]
  );

  // нажатие на edge
  const onEdgesClick = useCallback(
    (_: MouseEvent, edge: Edge) => {
      const chapterFromLocalStorage =
        path[0] && store.get(`story_${path[0]}_chapter_${path[1]}`);

      if (uuidValidate(edge.source)) {
        const points = JSON.parse(
          JSON.stringify(chapterFromLocalStorage?.points)
        );
        const pointsValues: pointType[] = Object.values(
          points
        ).flat() as pointType[];
        const targetPoint = pointsValues.find(
          (point) => point.id === edge.source
        );
        const targetStage = chapterFromLocalStorage?.stages?.find(
          (stage: stageType) => {
            return +stage.id === +edge.target;
          }
        );
        dispatch(
          setTransitionToStore({
            point: targetPoint,
            targetStage,
          })
        );
        setShowModalEditTransition(true);
      } else {
        const stage = chapterFromLocalStorage.stages.find(
          (stage: stageType) => +stage.id === +edge.source
        );

        const targetTransfer = stage?.transfers?.find(
          (transfer: stageTransfer) => +transfer.stage === +edge.target
        );

        const indexTargetTransfer = stage?.transfers?.indexOf(targetTransfer);
        setShowModalEditTransfer(true);
        dispatch(
          setTargetTransfer({
            targetTransfer,
            indexTargetTransfer,
          })
        );
        dispatch(setStageToRedux({ ...stage }));
      }
    },
    [chapter]
  );

  const updateTransitionFromMap = () => {
    let chapterFromLocalStorage: chapterType =
      path[0] && store.get(`story_${path[0]}_chapter_${path[1]}`);

    const transitionFromMap = storeRedux.getState().stage.transitionFromMap;

    // если нужной карты нет в главе создаем
    if (
      chapterFromLocalStorage.points &&
      !chapterFromLocalStorage?.points![transitionFromMap.mapId]
    ) {
      chapterFromLocalStorage.points[transitionFromMap.mapId] = [];
    }
    // если поменялся id карты то делаем
    if (transitionFromMap.mapId !== transitionFromMap.originalPoint.mapId) {
      const originalMapPoints =
        chapterFromLocalStorage.points![transitionFromMap.originalPoint.mapId];

      const transitionIndex = originalMapPoints.findIndex(
        (point: pointType) =>
          point.id === transitionFromMap.originalPoint.point.id
      );

      originalMapPoints.splice(transitionIndex, 1);
      chapterFromLocalStorage.points![transitionFromMap.mapId].push(
        transitionFromMap.point
      );
    } else {
      const transitionFromMapPoint =
        chapterFromLocalStorage?.points![transitionFromMap.mapId];
      const transitionIndex = transitionFromMapPoint.findIndex(
        (point: pointType) => {
          return point.id === transitionFromMap.originalPoint.point.id;
        }
      );

      transitionFromMapPoint.splice(
        transitionIndex,
        1,
        transitionFromMap.point
      );
    }

    updateChapter(chapterFromLocalStorage, true);
  };

  // Обновление стадии
  const updateStage = (stageId: number): void => {
    const chapterFromLocalStorage =
      path[0] && store.get(`story_${path[0]}_chapter_${path[1]}`);

    const stageIndex = chapterFromLocalStorage.stages.indexOf(
      chapterFromLocalStorage.stages.find(
        (stage: stageType) => stage.id === stageId
      )
    );

    const updatedStageWithUpdatedPosition = {
      ...storeRedux.getState().stage.stage,
      editor: {
        x:
          chapterFromLocalStorage.stages?.find(
            (stage: stageType) => +stage.id === +stageId
          )?.editor?.x || 0,
        y:
          chapterFromLocalStorage.stages?.find(
            (stage: stageType) => +stage.id === +stageId
          )?.editor?.y || 0,
      },
    };

    chapterFromLocalStorage.stages.splice(
      stageIndex,
      1,
      updatedStageWithUpdatedPosition
    );

    updateChapter(chapterFromLocalStorage, true);
  };

  const deletePoint = () => {
    const chapterFromLocalStorage =
      path[0] && store.get(`story_${path[0]}_chapter_${path[1]}`);
    const points = chapterFromLocalStorage.points[
      storeRedux.getState().stage.transitionFromMap.mapId
    ] as pointType[];

    const pointIndex = points.findIndex((point) => {
      return (
        point.id ===
        storeRedux.getState().stage.transitionFromMap.originalPoint.point.id
      );
    });

    points.splice(pointIndex, 1);
    updateChapter(chapterFromLocalStorage, true);
    dispatch(setStageToRedux(null));
    setEditableStage(undefined);
    dispatch(setTransition(null));
  };

  const onConnect = useCallback(
    (connection: any): void => {
      const chapterFromLocalStorage =
        path[0] && store.get(`story_${path[0]}_chapter_${path[1]}`);

      if (uuidValidate(connection.source)) {
        const points = JSON.parse(
          JSON.stringify(chapterFromLocalStorage?.points)
        );
        const pointsValues: pointType[] = Object.values(
          points
        ).flat() as pointType[];
        const targetPoint = pointsValues.find(
          (point) => point.id === connection.source
        );
        targetPoint!.data = {
          stage: String(connection.target),
          chapter: String(path[1]),
        };
        updateChapter(
          {
            ...chapterFromLocalStorage,
            points,
          },
          true
        );
      } else {
        dispatch(
          setConnection({
            source: connection.source,
            target: connection.target,
          })
        );

        const stageIndex = chapterFromLocalStorage.stages.indexOf(
          chapterFromLocalStorage.stages.find(
            (stage: stageType) => +stage.id === +connection.source
          )
        );

        const targetTransfer = chapterFromLocalStorage?.stages[
          stageIndex
        ]?.transfers.find(
          (transfer: stageTransfer) => transfer.stage === connection.target
        );

        setIsOpenCreateTransfer(true);

        dispatch(setTargetTransfer(targetTransfer));
        dispatch(setStageToRedux(chapterFromLocalStorage?.stages[stageIndex]));
      }
    },
    [setEdges, chapter]
  );

  function deleteStage(id: number): void {
    const chapterFromLocalStorage =
      path[0] && store.get(`story_${path[0]}_chapter_${path[1]}`);

    const indexStage = chapterFromLocalStorage?.stages?.findIndex(
      (stage: stageType) => stage.id === id
    );

    chapterFromLocalStorage?.stages?.splice(indexStage, 1);

    chapterFromLocalStorage && updateChapter(chapterFromLocalStorage, true);
    dispatch(setStageToRedux(null));
    setEditableStage(undefined);
  }

  const nodeTypes = useMemo(() => ({ nodeStage: NodeStage }), []);
  const edgeTypes = useMemo(() => ({ custom: TransferEdge }), []);

  const onDragStart = (event: DragEvent, nodeType: nodeCreateType) => {
    event.dataTransfer!.setData("application/reactflow", nodeType);
    event.dataTransfer!.effectAllowed = "move";
  };

  const onDragOver = useCallback((event: DragEventHandler<HTMLDivElement>) => {
    (event as unknown as DragEvent).preventDefault();
    (event as unknown as DragEvent).dataTransfer!.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event?.dataTransfer?.getData("application/reactflow");
      if (!type) return;

      const chapterFromLocalStorage =
        path[0] && store.get(`story_${path[0]}_chapter_${path[1]}`);

      let idLastStage =
        Math.max(
          ...chapterFromLocalStorage?.stages.map((stage: stageType) => stage.id)
        ) + 1;

      if (idLastStage === -Infinity) {
        idLastStage = 0;
      }

      // @ts-ignore
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds?.left!,
        y: event.clientY - reactFlowBounds?.top!,
      });

      if (type === "transition") {
        let mapId = maps[0].id;
        if (!mapId) mapId = "0";

        const newPoint = {
          id: uuidv4(),
          type: 0,
          name: "Переход с карты",
          pos: "500:500",
          data: {
            chapter: String(chapter?.id),
            stage: "",
          },
          condition: {},
          editor: {
            ...position,
          },
        };

        if (
          !chapterFromLocalStorage.points ||
          !chapterFromLocalStorage.points[mapId]
        ) {
          chapterFromLocalStorage.points = {
            ...chapterFromLocalStorage.points!,
            [mapId]: [],
          };
        }

        const updatedChapter = {
          ...chapterFromLocalStorage,
          points: {
            ...chapterFromLocalStorage.points,
            [mapId]: [...chapterFromLocalStorage.points[mapId], newPoint],
          },
        };
        updateChapter(updatedChapter, true);
      } else {
        const updatedChapter = {
          ...chapterFromLocalStorage,
          stages: [
            ...chapterFromLocalStorage?.stages,
            newStage(
              type as "default" | "exit" | "chapterEnd",
              idLastStage,
              true,
              position,
              {
                title: reduxStore.getState().stage.stage?.title || "",
                background: reduxStore.getState().stage.stage?.background || "",
              }
            ),
          ],
        };
        updateChapter(updatedChapter, true);
      }
    },
    [chapter, reactFlowInstance]
  );

  useEffect(() => {
    if (query.stage) {
      dispatch(setStageToRedux(null));
      setEditableStage(undefined);

      const chapterFromLocalStorage =
        path[0] && store.get(`story_${path[0]}_chapter_${path[1]}`);

      const stage = chapterFromLocalStorage.stages.find((stage: stageType) => {
        if (query.stage) {
          return stage.id === +query.stage;
        }
      });
      dispatch(setTransition(null));
      dispatch(setStageToRedux(null));
      setEditableStage(undefined);
      setTimeout(() => {
        dispatch(setStageToRedux(stage));
        setEditableStage(stage);

        focusOnTheNode(query.stage as string);
      }, 0);
    }
  }, [isReady]);

  useKeydown(["Delete"], (event) => {
    if (event.ctrlKey) {
      if (storeRedux.getState().stage.stage) {
        deleteStage(storeRedux.getState().stage.stage.id);
      }
      if (storeRedux.getState().stage.transitionFromMap) {
        deletePoint();
      }
    }
  });
  useKeydown(["Escape"], () => {
    setEditableStage(undefined);
  });

  const focusOnTheNode = (nodeId: string) => {
    const targetNode = nodes?.find((node) => node.id === nodeId);

    const x = targetNode?.position?.x! + targetNode?.width! / 2;
    const y = targetNode?.position?.y! + targetNode?.height! / 2;
    const zoom = 1.85;
    reactFlowInstance?.setCenter(x, y, {
      zoom,
      duration: 1000,
    });
  };

  interface IStatisticSelected {
    stages: stageType[];
    points: pointType[];
    show: boolean;
  }

  const [statisticSelected, setStatisticSelected] =
    useState<IStatisticSelected>();

  const {
    onOpen: movingStagesOnOpen,
    isOpen: movingStagesIsOpen,
    onClose: movingStagesOnClose,
  } = useDisclosure();

  const onSelectionChange = ({
    nodes,
  }: {
    nodes: CustomNode[];
    edges: Edge[];
  }) => {
    const nodesId = nodes.map((node) => {
      const nodeId = +node.id;
      if (isNaN(nodeId)) {
        return node.id;
      }
      return nodeId;
    });
    const chapterFromLocalStorage: chapterType =
      path[0] && store.get(`story_${path[0]}_chapter_${path[1]}`);

    const stages = chapterFromLocalStorage?.stages.filter((stage) => {
      if (nodesId.includes(stage.id)) {
        return true;
      }
    });
    const pointsEntries = Object.entries(chapterFromLocalStorage?.points ?? {});

    const points: pointType[] = [];
    pointsEntries.map((arrPoint) => {
      arrPoint[1].map((point) => {
        if (nodesId.includes(point.id as string)) {
          points.push({
            ...point,
            mapId: arrPoint[0],
          });
        }
      });
    });

    if (
      statisticSelected?.points?.length !== points?.length! ||
      statisticSelected?.stages?.length !== stages?.length!
    ) {
      setStatisticSelected({
        points: points!,
        stages: stages!,
        show: points?.length! > 0 || stages?.length! > 0,
      });
    }
  };

  const forceSyncPosition = () => {
    logger.info("Start sync");

    const chapterFromLocalStorage: chapterType =
      path[0] && store.get(`story_${path[0]}_chapter_${path[1]}`);

    const pointsEntries = Object.entries(chapterFromLocalStorage?.points ?? {});

    nodes?.forEach((node) => {
      if (uuidValidate(node.id)) {
        // если нода это точка
        pointsEntries.map((arrPoint) => {
          arrPoint[1].map((point) => {
            if (String(point.id) === String(node.id)) {
              point.editor = {
                x: node.position.x,
                y: node.position.y,
              };
            }
          });
        });
      } else {
        // если нода это стадия
        const findNode = chapterFromLocalStorage.stages.find(
          (stage) => String(stage.id) === String(node.id)
        );
        if (findNode) {
          findNode.editor = {
            x: node.position.x,
            y: node.position.y,
          };
        }
      }
    });

    store.set(`story_${path[0]}_chapter_${path[1]}`, chapterFromLocalStorage);
  };

  return (
    <>
      <CustomHead title={"Редактирование главы " + chapter?.id} />
      <Box
        display="flex"
        p={1}
        gap={1}
        borderBottom="1px"
        alignItems="center"
        borderBottomColor="gray.200"
        _dark={{
          borderBottom: "1px solid #171923",
        }}
      >
        <CreateStage onDragStart={onDragStart as any} />
        <Text>
          {chapter?.title
            ? chapter?.title + " -- ID: " + chapter?.id
            : `Глава ${chapter?.id}`}
        </Text>
        <Spacer />
        {!!statisticSelected?.stages?.length && (
          <Box>{statisticSelected?.stages?.length} stage</Box>
        )}
        {!!statisticSelected?.points?.length && (
          <Box>{statisticSelected?.points?.length} point</Box>
        )}
        {statisticSelected?.show && (
          <Button
            size="sm"
            fontWeight="normal"
            colorScheme="teal"
            onClick={movingStagesOnOpen}
          >
            Перенос в другую главу
          </Button>
        )}
        {chapter && (
          <ToStage
            setEditableStage={setEditableStage}
            chapter={chapter}
            focusOnTheNode={focusOnTheNode}
          />
        )}
        {settings.enableUtilities && (
          <Button
            fontWeight="normal"
            size="sm"
            onClick={() => forceSyncPosition()}
          >
            Синхронизация
          </Button>
        )}
        {settings.enableUtilities && (
          <Button
            onClick={() => {
              onOpenLogs();
            }}
            fontWeight="normal"
            size="sm"
          >
            Утилиты
          </Button>
        )}
        <Button
          onClick={() => {
            onLayout("TB");
          }}
          fontWeight="normal"
          size="sm"
        >
          Сортировка
        </Button>
      </Box>
      <Box h="calc(100vh - 83px)">
        {editableStage && (
          <EditStagePopover
            updateStage={updateStage}
            deleteStage={deleteStage}
            deletePoint={deletePoint}
            setEditableStage={setEditableStage}
            updateTransitionFromMap={updateTransitionFromMap}
          />
        )}
        <Box ref={reactFlowWrapper} height="100%">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgeClick={onEdgesClick}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              onDrop={onDrop as () => void}
              onDragOver={onDragOver as any}
              onInit={setReactFlowInstance}
              edgeTypes={edgeTypes}
              onlyRenderVisibleElements={settings.onlyRenderVisibleElements}
              onSelectionChange={(e) => onSelectionChange(e)}
              minZoom={0.01}
              fitView
            >
              {settings.showMiniMap && <MiniMap zoomable pannable />}
              <Controls />
              <Background
                color={colorMode === "light" ? "#000000" : "#ffffff"}
                style={{
                  backgroundColor:
                    colorMode === "light" ? "#f5f5f5" : "#1e293b",
                }}
              />
            </ReactFlow>
          </ReactFlowProvider>
        </Box>

        {!!path[0] && (
          <MovingStagesModal
            isOpen={movingStagesIsOpen}
            onClose={movingStagesOnClose}
            stages={statisticSelected?.stages}
            points={statisticSelected?.points}
            currentStory={path[0]}
            currentChapter={path[1]}
          />
        )}

        <CreateTransferModal
          setIsOpenCreateTransfer={setIsOpenCreateTransfer}
          updateStage={updateStage}
          isOpenCreateTransfer={isOpenCreateTransfer}
        />

        <EditTransferModal
          setShowModalEditTransfer={setShowModalEditTransfer}
          showModalEditTransfer={showModalEditTransfer}
          updateStage={updateStage}
        />
        <EditTransitionModal
          setShowModalEditTransition={setShowModalEditTransition}
          showModalEditTransition={showModalEditTransition}
        />
        <UtilitiesDrawer
          chapter={chapter!}
          openStage={focusOnTheNode}
          onClose={onCloseLogs}
          isOpen={isOpenLogs}
        />
      </Box>
    </>
  );
}
