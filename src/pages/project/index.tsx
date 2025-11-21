import { Graph } from '@antv/x6';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';

interface NodeInfo {
  id: string;
  label: string;
  description?: string;
  join?: boolean;
  status?: string;
  progress?: number;
  totalCount?: number;
  successCount?: number;
  failedCount?: number;
  abortCount?: number;
}

interface NodeData extends NodeInfo {
  status: string;
  progress: number;
  totalCount: number;
  successCount: number;
  failedCount: number;
  abortCount: number;
}

const Project = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const projectContainerRef = useRef<HTMLDivElement>(null);
  const graphRef = useRef<Graph | null>(null);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipContent, setTooltipContent] = useState<NodeInfo | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // 创建 X6 图实例
    const graph = new Graph({
      container: containerRef.current,
      width: containerRef.current.offsetWidth,
      height: 300,
      grid: {
        visible: false,
      },
      panning: {
        enabled: false, // 禁用画布拖拽
      },
      mousewheel: {
        enabled: false, // 禁用缩放
      },
      interacting: {
        nodeMovable: false, // 禁用节点移动
      },
    });

    graphRef.current = graph;

    // 定义节点数据（不包含 x, y 坐标，将自动计算）
    const nodes: NodeData[] = [
      {
        id: 'input',
        label: '输入',
        status: 'success', // 绿色
        description: '数据输入节点，负责接收外部数据',
        progress: 100,
        totalCount: 10000,
        successCount: 5000,
        failedCount: 2000,
        abortCount: 3000,
      },
      {
        id: 'getVid',
        label: '获取vid',
        status: 'success', // 绿色
        description: '获取视频ID，用于后续处理',
        progress: 100,
        totalCount: 10000,
        successCount: 5000,
        failedCount: 2000,
        abortCount: 3000,
      },
      {
        id: 'translate',
        label: '翻译标题',
        status: 'success', // 绿色
        description: '将标题翻译为目标语言',
        progress: 100,
        totalCount: 5000,
        successCount: 5000,
        failedCount: 0,
        abortCount: 0,
        join: true,
      },
      {
        id: 'portrait',
        label: '跑人像模型',
        status: 'warning', // 黄色
        description: '运行人像识别模型，处理图像数据',
        progress: 60,
        totalCount: 5000,
        successCount: 3000,
        failedCount: 0,
        abortCount: 0,
      },
      {
        id: 'cut',
        label: '切条',
        status: 'default', // 灰色
        description: '将视频切分成多个片段',
        progress: 0,
        totalCount: 0,
        successCount: 0,
        failedCount: 0,
        abortCount: 0,
      },
      {
        id: 'output',
        label: '输出',
        status: 'default', // 灰色
        description: '输出最终处理结果',
        progress: 0,
        totalCount: 0,
        successCount: 0,
        failedCount: 0,
        abortCount: 0,
      },
    ];

    // 定义边的连接关系
    const edges = [
      { source: 'input', target: 'getVid' },
      { source: 'getVid', target: 'translate' },
      { source: 'translate', target: 'portrait' },
      { source: 'portrait', target: 'cut' },
      { source: 'cut', target: 'output' },
    ];

    // 定义节点尺寸常量（需要在多个地方使用）
    const NODE_WIDTH = 140;
    const NODE_HEIGHT = 60;

    // 自动布局算法：根据边的连接关系计算节点位置
    const calculateNodePositions = () => {
      const HORIZONTAL_SPACING = 200; // 节点之间的水平间距
      const START_X = 50; // 起始 X 坐标
      const START_Y = 120; // 起始 Y 坐标（垂直居中）

      // 构建节点顺序（拓扑排序）
      const nodeMap = new Map<string, NodeData>();
      nodes.forEach((node) => {
        nodeMap.set(node.id, node);
      });

      // 计算每个节点的层级（距离起点的距离）
      const levels = new Map<string, number>();
      const visited = new Set<string>();

      const dfs = (nodeId: string, level: number) => {
        if (visited.has(nodeId)) {
          const currentLevel = levels.get(nodeId) || 0;
          levels.set(nodeId, Math.max(currentLevel, level));
          return;
        }
        visited.add(nodeId);
        levels.set(nodeId, level);

        // 找到所有以当前节点为源的边
        edges.forEach((edge) => {
          if (edge.source === nodeId) {
            dfs(edge.target, level + 1);
          }
        });
      };

      // 找到起始节点（没有入边的节点）
      const hasIncomingEdge = new Set<string>();
      edges.forEach((edge) => {
        hasIncomingEdge.add(edge.target);
      });

      nodes.forEach((node) => {
        if (!hasIncomingEdge.has(node.id)) {
          dfs(node.id, 0);
        }
      });

      // 根据层级计算位置
      const positions = new Map<string, { x: number; y: number }>();
      nodes.forEach((node) => {
        const level = levels.get(node.id) || 0;
        positions.set(node.id, {
          x: START_X + level * HORIZONTAL_SPACING,
          y: START_Y,
        });
      });

      return positions;
    };

    const nodePositions = calculateNodePositions();

    // 计算阶段划分
    const calculateStages = () => {
      // 获取节点顺序（按层级排序）
      const nodeOrder: NodeData[] = [];
      const levels = new Map<string, number>();
      const visited = new Set<string>();

      const dfs = (nodeId: string, level: number) => {
        if (visited.has(nodeId)) {
          const currentLevel = levels.get(nodeId) || 0;
          levels.set(nodeId, Math.max(currentLevel, level));
          return;
        }
        visited.add(nodeId);
        levels.set(nodeId, level);

        edges.forEach((edge) => {
          if (edge.source === nodeId) {
            dfs(edge.target, level + 1);
          }
        });
      };

      const hasIncomingEdge = new Set<string>();
      edges.forEach((edge) => {
        hasIncomingEdge.add(edge.target);
      });

      nodes.forEach((node) => {
        if (!hasIncomingEdge.has(node.id)) {
          dfs(node.id, 0);
        }
      });

      // 按层级排序节点
      const nodesWithLevel = nodes.map((node) => ({
        node,
        level: levels.get(node.id) || 0,
      }));
      nodesWithLevel.sort((a, b) => a.level - b.level);
      nodesWithLevel.forEach(({ node }) => {
        nodeOrder.push(node);
      });

      // 找到所有 join 为 true 的节点索引
      const joinIndices: number[] = [];
      nodeOrder.forEach((node, index) => {
        if (node.join) {
          joinIndices.push(index);
        }
      });

      // 如果没有 join 节点，返回空数组（不绘制阶段框）
      if (joinIndices.length === 0) {
        return [];
      }

      // 根据 join 节点划分阶段
      const stages: Array<{ startIndex: number; endIndex: number }> = [];
      let startIndex = 0;

      joinIndices.forEach((joinIndex) => {
        // 当前阶段：从 startIndex 到 joinIndex（包含 join 节点）
        stages.push({
          startIndex,
          endIndex: joinIndex,
        });
        // 下一个阶段从 joinIndex + 1 开始
        startIndex = joinIndex + 1;
      });

      // 添加最后一个阶段（如果有剩余节点）
      if (startIndex < nodeOrder.length) {
        stages.push({
          startIndex,
          endIndex: nodeOrder.length - 1,
        });
      }

      return stages.map((stage) => ({
        startNode: nodeOrder[stage.startIndex],
        endNode: nodeOrder[stage.endIndex],
      }));
    };

    const stages = calculateStages();

    // 创建阶段背景框
    const STAGE_PADDING = 20; // 阶段框的内边距
    const STAGE_MARGIN = 10; // 阶段之间的间距

    stages.forEach((stage, stageIndex) => {
      const startPos = nodePositions.get(stage.startNode.id) || { x: 0, y: 0 };
      const endPos = nodePositions.get(stage.endNode.id) || { x: 0, y: 0 };

      // 计算阶段框的位置和尺寸
      const stageX = startPos.x - STAGE_PADDING;
      const stageY = startPos.y - STAGE_PADDING;
      const stageWidth = endPos.x + NODE_WIDTH + STAGE_PADDING - stageX;
      const stageHeight = NODE_HEIGHT + STAGE_PADDING * 2;

      // 创建阶段背景框
      graph.addNode({
        id: `stage-${stageIndex}`,
        x: stageX,
        y: stageY,
        width: stageWidth,
        height: stageHeight,
        shape: 'rect',
        movable: false,
        connectable: false,
        zIndex: -1, // 确保背景框在最底层
        attrs: {
          body: {
            stroke: '#1890ff',
            fill: 'rgba(24, 144, 255, 0.05)',
            strokeWidth: 2,
            strokeDasharray: '5,5',
            rx: 8,
            ry: 8,
            pointerEvents: 'none', // 不拦截鼠标事件
          },
        },
      });
    });

    // 创建节点
    // 定义节点内部元素的布局常量
    const NODE_CENTER_X = NODE_WIDTH / 2; // 节点中心 X 坐标：70

    // 圆点配置（坐标相对于节点左上角）
    const STATUS_DOT_CX = 20; // 圆点中心 X 坐标（相对于节点左上角）
    const STATUS_DOT_CY = 30; // 圆点中心 Y 坐标（调整到上方）
    const STATUS_DOT_R = 6; // 圆点半径
    const LABEL_SPACING = 6; // 圆点与文本之间的间距

    // 文本配置
    // 注意：在 X6 中，text 元素的坐标是相对于节点中心的
    const LABEL_X_RELATIVE_TO_CENTER = -32; // 相对于节点中心的 X 坐标
    const LABEL_Y_RELATIVE_TO_CENTER = -10; // 相对于节点中心的 Y 坐标（上方）
    const PROGRESS_Y_RELATIVE_TO_CENTER = 10; // 进度信息 Y 坐标（下方）

    const NODE_LAYOUT = {
      STATUS_DOT: {
        CX: STATUS_DOT_CX,
        CY: STATUS_DOT_CY,
        R: STATUS_DOT_R,
      },
      LABEL: {
        X: LABEL_X_RELATIVE_TO_CENTER,
        Y: LABEL_Y_RELATIVE_TO_CENTER,
        SPACING: LABEL_SPACING,
      },
      PROGRESS: {
        Y: PROGRESS_Y_RELATIVE_TO_CENTER,
      },
    };

    nodes.forEach((node) => {
      const statusColors = {
        success: '#52c41a', // 绿色
        warning: '#faad14', // 黄色
        default: '#d9d9d9', // 灰色
      };

      const color = statusColors[node.status as keyof typeof statusColors];

      const position = nodePositions.get(node.id) || { x: 0, y: 0 };

      // 使用节点的 progress 字段作为进度百分比
      const progressPercent = node.progress || 0;

      const nodeInstance = graph.addNode({
        id: node.id,
        x: position.x,
        y: position.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        shape: 'rect',
        movable: false, // 禁用节点移动
        connectable: false, // 禁用连接点
        markup: [
          {
            tagName: 'rect',
            selector: 'body',
          },
          {
            tagName: 'circle',
            selector: 'statusDot',
          },
          {
            tagName: 'text',
            selector: 'label',
          },
          {
            tagName: 'text',
            selector: 'progress',
          },
        ],
        attrs: {
          body: {
            stroke: '#e8e8e8',
            fill: '#ffffff',
            rx: 8,
            ry: 8,
            strokeWidth: 1,
            cursor: 'pointer',
          },
          statusDot: {
            r: NODE_LAYOUT.STATUS_DOT.R,
            cx: NODE_LAYOUT.STATUS_DOT.CX,
            cy: NODE_LAYOUT.STATUS_DOT.CY,
            fill: color,
            stroke: '#ffffff',
            strokeWidth: 2,
          },
          label: {
            text: node.label,
            x: NODE_LAYOUT.LABEL.X,
            y: NODE_LAYOUT.LABEL.Y,
            fontSize: 12,
            fill: '#333333',
            textAnchor: 'start',
            textVerticalAnchor: 'middle',
            fontFamily: 'AlibabaSans, sans-serif',
          },
          progress: {
            text: `${progressPercent}%`,
            x: NODE_LAYOUT.LABEL.X,
            y: NODE_LAYOUT.PROGRESS.Y,
            fontSize: 11,
            fill: '#666666',
            textAnchor: 'start',
            textVerticalAnchor: 'middle',
            fontFamily: 'AlibabaSans, sans-serif',
          },
        },
      });

      // 存储节点信息到节点数据中，方便后续使用
      nodeInstance.setData(node);
    });

    // 创建连接线（使用之前定义的 edges）

    edges.forEach((edge) => {
      graph.addEdge({
        source: { cell: edge.source, anchor: { name: 'right' } },
        target: { cell: edge.target, anchor: { name: 'left' } },
        attrs: {
          line: {
            stroke: '#d9d9d9',
            strokeWidth: 2,
            targetMarker: {
              name: 'block',
              width: 12,
              height: 8,
            },
          },
        },
        zIndex: 0,
      });
    });

    // 居中显示
    graph.centerContent();

    // 添加全局节点事件监听器
    const updateTooltipPosition = (node: any) => {
      // 获取节点在画布中的位置
      const bbox = node.getBBox();
      // 获取节点中心点的画布坐标
      const centerX = bbox.x + bbox.width / 2;
      const centerY = bbox.y;

      // 转换为页面坐标（相对于视口）
      const clientPoint = graph.localToClient(centerX, centerY);

      // 直接使用视口坐标（tooltip 使用 fixed 定位）
      setTooltipPosition({
        x: clientPoint.x,
        y: clientPoint.y - 10,
      });
    };

    graph.on('node:mouseenter', ({ node }) => {
      const nodeData = node.getData<NodeData>();
      if (nodeData) {
        const nodeInfo: NodeInfo = {
          id: nodeData.id,
          label: nodeData.label,
          description: nodeData.description,
          status: nodeData.status,
          progress: nodeData.progress,
          totalCount: nodeData.totalCount,
          successCount: nodeData.successCount,
          failedCount: nodeData.failedCount,
          abortCount: nodeData.abortCount,
        };
        setTooltipContent(nodeInfo);
        updateTooltipPosition(node);
        setTooltipVisible(true);
      }
    });

    graph.on('node:mousemove', ({ node }) => {
      updateTooltipPosition(node);
    });

    graph.on('node:mouseleave', () => {
      setTooltipVisible(false);
    });

    // 响应窗口大小变化
    const handleResize = () => {
      if (containerRef.current && graphRef.current) {
        graphRef.current.resize(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight,
        );
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      graph.dispose();
    };
  }, []);

  return (
    <div ref={projectContainerRef} className="project-container">
      <div className="project-title">工作流 DAG 图</div>
      <div ref={containerRef} className="project-graph" />
      {tooltipVisible && tooltipContent && (
        <div
          className="node-tooltip"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            display: 'block',
          }}
        >
          <div className="tooltip-title">{tooltipContent.label}</div>
          {tooltipContent.description && (
            <div className="tooltip-desc">{tooltipContent.description}</div>
          )}
          <div
            className={`tooltip-status tooltip-status-${tooltipContent.status || 'default'}`}
          >
            状态:{' '}
            {tooltipContent.status === 'success'
              ? '已完成'
              : tooltipContent.status === 'warning'
                ? '进行中'
                : '待处理'}
          </div>
          {tooltipContent.totalCount !== undefined && (
            <div className="tooltip-counts">
              <div className="tooltip-count-item">
                <span className="count-label">总数量:</span>
                <span className="count-value">{tooltipContent.totalCount}</span>
              </div>
              <div className="tooltip-count-item">
                <span className="count-label">成功数量:</span>
                <span className="count-value success">
                  {tooltipContent.successCount}
                </span>
              </div>
              <div className="tooltip-count-item">
                <span className="count-label">失败数量:</span>
                <span className="count-value failed">
                  {tooltipContent.failedCount}
                </span>
              </div>
              <div className="tooltip-count-item">
                <span className="count-label">终止数量:</span>
                <span className="count-value abort">
                  {tooltipContent.abortCount}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Project;
