/**
 * FreeRTOS IPC 选型决策树类型定义
 *
 * 决策树由两类节点组成：
 *   - QuestionNode: 提问节点，给出若干 OptionNode 让用户选择
 *   - RecommendationNode: 叶节点，推荐具体的 FreeRTOS API 方案
 */

/** 决策树通用节点 */
export type DecisionNode = QuestionNode | RecommendationNode;

/** 节点类别判别字段 */
export type NodeKind = "question" | "recommendation";

/** 提问节点（中间节点） */
export interface QuestionNode {
  kind: "question";
  /** 节点唯一 ID（用于路径定位与测试） */
  id: string;
  /** 给用户看的问题文本 */
  question: string;
  /** 可选答案列表 */
  options: OptionNode[];
}

/** 选项（连接到下一个 DecisionNode） */
export interface OptionNode {
  /** 选项 value（路径里就是这个） */
  value: string;
  /** 选项 label */
  label: string;
  /** 简短描述（可选，用于按钮副标题） */
  hint?: string;
  /** 子节点 */
  next: DecisionNode;
}

/** 推荐方案叶节点 */
export interface RecommendationNode {
  kind: "recommendation";
  /** 节点唯一 ID */
  id: string;
  /** 推荐方案标题（如 "Mutex with Priority Inheritance"） */
  title: string;
  /** 主要 API 名称（FreeRTOS 函数名） */
  api: string;
  /** 适用场景描述 */
  scenario: string;
  /** 典型 C 代码示例（4-10 行） */
  codeExample: CodeSnippet;
  /** 使用陷阱（注意事项），1-2 条 */
  pitfalls: string[];
  /** 替代方案 */
  alternatives: Alternative[];
}

/** 代码片段 */
export interface CodeSnippet {
  /** 语言标识（默认 c） */
  language: "c";
  /** 代码内容 */
  code: string;
}

/** 替代方案 */
export interface Alternative {
  /** 替代 API 名称 */
  api: string;
  /** 与主推荐方案的区别 */
  difference: string;
}
