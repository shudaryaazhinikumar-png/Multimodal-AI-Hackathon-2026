import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, FileText, Video, Presentation, BookOpen, ArrowRight, TrendingUp, Target } from 'lucide-react';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayButton } from '@/components/clay/ClayButton';
import { ClayBadge } from '@/components/clay/ClayBadge';
import { ClayProgress } from '@/components/clay/ClayProgress';
import { ClayDrawer } from '@/components/clay/ClayTabs';
import { mockKnowledgeGraph } from '@/services/mock/mockData';
import type { KnowledgeGraphNode } from '@/types';

const masteryColors = (mastery: number) => {
  if (mastery >= 80) return { fill: '#5AAB86', bg: '#E0F2ED', stroke: '#9DD3BE' };
  if (mastery >= 60) return { fill: '#E0B23E', bg: '#FDF4DC', stroke: '#F7D98C' };
  if (mastery >= 40) return { fill: '#E2795C', bg: '#FDE8DD', stroke: '#F5B197' };
  return { fill: '#B8AB8E', bg: '#F5F2EA', stroke: '#D4CAB4' };
};

export function KnowledgeMapPage() {
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState<KnowledgeGraphNode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNodeClick = (node: KnowledgeGraphNode) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  };

  const relatedMaterials = [
    { title: 'ML Textbook Ch. 5', type: 'pdf' as const, icon: FileText, color: '#E2795C' },
    { title: 'Neural Networks Lecture 04', type: 'video' as const, icon: Video, color: '#7C3AED' },
    { title: 'Week 4 Slides', type: 'slide' as const, icon: Presentation, color: '#5AAB86' },
    { title: 'Backpropagation Notes', type: 'note' as const, icon: BookOpen, color: '#E0B23E' },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900">Knowledge Map</h1>
        <p className="mt-1 text-sm text-clay-600">Visualize relationships between your learning topics. Click any node to explore.</p>
      </div>

      {/* Legend */}
      <ClayCard className="flex flex-wrap items-center gap-4">
        <span className="text-sm font-medium text-charcoal-700">Mastery:</span>
        {[
          { label: 'High (80%+)', color: '#5AAB86' },
          { label: 'Medium (60%+)', color: '#E0B23E' },
          { label: 'Low (40%+)', color: '#E2795C' },
          { label: 'New (<40%)', color: '#B8AB8E' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-clay-600">{item.label}</span>
          </div>
        ))}
      </ClayCard>

      {/* Graph */}
      <ClayCard className="relative overflow-hidden p-0">
        <div className="relative h-[600px] w-full overflow-hidden sm:h-[560px]" style={{ minHeight: '450px' }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0">
            {/* Edges — orthogonal elbow connectors */}
            {mockKnowledgeGraph.edges.map((edge, i) => {
              const from = mockKnowledgeGraph.nodes.find((n) => n.id === edge.from);
              const to = mockKnowledgeGraph.nodes.find((n) => n.id === edge.to);
              if (!from || !to) return null;
              const midY = (from.y + to.y) / 2;
              const path = `M ${from.x} ${from.y} L ${from.x} ${midY} L ${to.x} ${midY} L ${to.x} ${to.y}`;
              return (
                <motion.path
                  key={i}
                  d={path}
                  fill="none"
                  stroke="#D4CAB4"
                  strokeWidth="0.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                />
              );
            })}
          </svg>

          {/* Nodes */}
          {mockKnowledgeGraph.nodes.map((node, i) => {
            const colors = masteryColors(node.mastery);
            const clampedX = Math.max(8, Math.min(92, node.x));
            const clampedY = Math.max(6, Math.min(94, node.y));
            return (
              <motion.button
                key={node.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.1, zIndex: 20 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNodeClick(node)}
                className="absolute flex flex-col items-center gap-1"
                style={{
                  left: `${clampedX}%`,
                  top: `${clampedY}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className="flex items-center justify-center rounded-clay shadow-clay"
                  style={{
                    backgroundColor: colors.bg,
                    border: `2px solid ${colors.stroke}`,
                    padding: '6px 10px',
                  }}
                >
                  <span className="text-[11px] font-semibold text-charcoal-900 whitespace-nowrap sm:text-xs">{node.label}</span>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: colors.fill }}
                >
                  {node.mastery}%
                </span>
              </motion.button>
            );
          })}
        </div>
      </ClayCard>

      {/* Node Detail Drawer */}
      <ClayDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={selectedNode?.label}>
        {selectedNode && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <ClayBadge variant="violet">Topic</ClayBadge>
              <span className="text-2xl font-bold text-charcoal-900">{selectedNode.mastery}%</span>
            </div>
            <ClayProgress value={selectedNode.mastery} color={selectedNode.mastery >= 80 ? 'mint' : selectedNode.mastery >= 60 ? 'warmyellow' : 'peach'} size="lg" />

            {/* Assessment Performance */}
            <div className="rounded-clay bg-ivory-100 p-4 shadow-clay-pressed">
              <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-charcoal-900">
                <Target size={16} className="text-violet-600" />
                Assessment Performance
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-clay-600">Recent accuracy</span>
                <span className="font-medium text-charcoal-900">{selectedNode.mastery}%</span>
              </div>
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-clay-600">Last assessed</span>
                <span className="font-medium text-charcoal-900">2 days ago</span>
              </div>
            </div>

            {/* Related Materials */}
            <div>
              <p className="mb-2 text-sm font-semibold text-charcoal-900">Related Materials</p>
              <div className="space-y-2">
                {relatedMaterials.map((mat, i) => {
                  const Icon = mat.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setDrawerOpen(false);
                        navigate('/knowledge');
                      }}
                      className="flex w-full items-center gap-2 rounded-clay bg-ivory-100 p-3 text-left hover:bg-ivory-200"
                    >
                      <Icon size={16} style={{ color: mat.color }} />
                      <span className="flex-1 text-sm text-charcoal-700">{mat.title}</span>
                      <ArrowRight size={14} className="text-clay-400" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recommendation */}
            <div className="rounded-clay bg-violet-50 p-4 ring-2 ring-violet-200">
              <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-violet-700">
                <TrendingUp size={16} />
                Recommendation
              </p>
              <p className="text-sm text-charcoal-700">
                {selectedNode.mastery < 70
                  ? `Focus on ${selectedNode.label} — your mastery is below 70%. A 10-minute revision session is recommended.`
                  : `${selectedNode.label} looks strong. Consider advancing to the next topic.`}
              </p>
              <ClayButton
                size="sm"
                className="mt-3"
                onClick={() => {
                  setDrawerOpen(false);
                  navigate(selectedNode.mastery < 70 ? '/revision' : '/learning');
                }}
              >
                {selectedNode.mastery < 70 ? 'Start Revision' : 'Continue Learning'}
              </ClayButton>
            </div>
          </div>
        )}
      </ClayDrawer>
    </div>
  );
}
