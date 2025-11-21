import { Graph } from '@antv/x6';
import React, { useEffect, useRef, useState } from 'react';
import './index.less';

interface NodeInfo {
  id: string;
  label: string;
  status: string;
  description?: string;
}

interface NodeData extends NodeInfo {
  x: number;
  y: number;
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

    // 定义节点数据
    const nodes: NodeData[] = [
      {
        id: 'input',
        label: '输入',
        status: 'success', // 绿色
        description: '数据输入节点，负责接收外部数据',
        x: 50,
        y: 120,
      },
      {
        id: 'getVid',
        label: '获取vid',
        status: 'success', // 绿色
        description: '获取视频ID，用于后续处理',
        x: 250,
        y: 120,
      },
      {
        id: 'translate',
        label: '翻译标题',
        status: 'success', // 绿色
        description: '将标题翻译为目标语言',
        x: 450,
        y: 120,
      },
      {
        id: 'portrait',
        label: '跑人像模型',
        status: 'warning', // 黄色
        description: '运行人像识别模型，处理图像数据',
        x: 650,
        y: 120,
      },
      {
        id: 'cut',
        label: '切条',
        status: 'default', // 灰色
        description: '将视频切分成多个片段',
        x: 850,
        y: 120,
      },
      {
        id: 'output',
        label: '输出',
        status: 'default', // 灰色
        description: '输出最终处理结果',
        x: 1050,
        y: 120,
      },
    ];

    // 创建节点
    nodes.forEach((node) => {
      const statusColors = {
        success: '#52c41a', // 绿色
        warning: '#faad14', // 黄色
        default: '#d9d9d9', // 灰色
      };

      const color = statusColors[node.status as keyof typeof statusColors];

      const nodeInstance = graph.addNode({
        id: node.id,
        x: node.x,
        y: node.y,
        width: 140,
        height: 60,
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
            r: 6,
            cx: 20,
            cy: 30,
            fill: color,
            stroke: '#ffffff',
            strokeWidth: 2,
          },
          label: {
            text: node.label,
            x: -32,
            fontSize: 12,
            fill: '#333333',
            textAnchor: 'start',
            textVerticalAnchor: 'middle',
            fontFamily: 'AlibabaSans, sans-serif',
          },
        },
      });

      // 存储节点信息到节点数据中，方便后续使用
      nodeInstance.setData(node);
    });

    // 创建连接线
    const edges = [
      { source: 'input', target: 'getVid' },
      { source: 'getVid', target: 'translate' },
      { source: 'translate', target: 'portrait' },
      { source: 'portrait', target: 'cut' },
      { source: 'cut', target: 'output' },
    ];

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
          status: nodeData.status,
          description: nodeData.description,
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
          <div className="tooltip-status">
            状态:{' '}
            {tooltipContent.status === 'success'
              ? '已完成'
              : tooltipContent.status === 'warning'
                ? '进行中'
                : '待处理'}
          </div>
        </div>
      )}
    </div>
  );
};

export default Project;
