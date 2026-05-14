import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DIAGRAMS = [
  { id: 'system',    label: 'System Architecture', emoji: '🏗', description: 'Overall system components and data flow' },
  { id: 'ci',       label: 'CI Pipeline',          emoji: '🔄', description: 'Continuous integration workflow stages' },
  { id: 'cd',       label: 'CD Workflow',           emoji: '🚀', description: 'Continuous deployment and environment lifecycle' },
  { id: 'lifecycle',label: 'Env Lifecycle',         emoji: '⏱', description: 'Dynamic environment state machine' },
  { id: 'docker',   label: 'Docker Interaction',    emoji: '🐳', description: 'Container networking and volume interactions' },
  { id: 'user',     label: 'User Flow',             emoji: '👤', description: 'Developer journey from push to preview' },
  { id: 'cleanup',  label: 'Cleanup Workflow',      emoji: '🗑', description: 'Resource cleanup and TTL management' },
];

function Node({ x, y, label, sub, color = '#4f9eff', icon = '', width = 120, height = 56 }) {
  return (
    <g>
      <rect x={x - width/2} y={y - height/2} width={width} height={height}
        rx="10" fill={`${color}14`} stroke={color} strokeWidth="1.5" />
      <text x={x} y={y - 6} textAnchor="middle" fill={color} fontSize="13" fontWeight="700">{icon} {label}</text>
      {sub && <text x={x} y={y + 12} textAnchor="middle" fill="#8b9ab8" fontSize="10">{sub}</text>}
    </g>
  );
}

function Arrow({ x1, y1, x2, y2, color = 'rgba(79,158,255,0.4)', dashed = false, label = '' }) {
  const mx = (x1 + x2) / 2; const my = (y1 + y2) / 2;
  const id = `arr${x1}${y1}${x2}${y2}`;
  return (
    <g>
      <defs>
        <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill={color} />
        </marker>
      </defs>
      <line x1={x1} y1={y1} x2={x2} y2={y2}
        stroke={color} strokeWidth="1.5"
        strokeDasharray={dashed ? '5 3' : 'none'}
        markerEnd={`url(#${id})`}
      />
      {label && <text x={mx} y={my - 6} textAnchor="middle" fill="#8b9ab8" fontSize="10">{label}</text>}
    </g>
  );
}

function SystemArchDiagram() {
  return (
    <svg viewBox="0 0 900 480" width="100%" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Node x={80}  y={80}  icon="👨‍💻" label="Developer"      color="#a78bfa" width={110} />
      <Arrow x1={135} y1={80} x2={215} y2={80} color="rgba(167,139,250,0.6)" label="git push" />
      <Node x={280} y={80}  icon="⎇"   label="GitHub"         sub="Repository"        color="#4f9eff" />
      <Arrow x1={280} y1={108} x2={280} y2={168} color="rgba(79,158,255,0.5)" label="webhook" />
      <Node x={280} y={220} icon="⚡"  label="GitHub Actions" sub="CI/CD Runner"       color="#ffd166" width={150} />
      <Arrow x1={205} y1={240} x2={140} y2={330} color="rgba(0,212,255,0.4)" />
      <Node x={110} y={360} icon="⚒"  label="Maven Build"    sub="Spring Boot JAR"   color="#00d4ff" width={140} />
      <Arrow x1={355} y1={240} x2={400} y2={330} color="rgba(79,158,255,0.4)" />
      <Node x={420} y={360} icon="🐳"  label="Docker Engine"  sub="Container Runtime" color="#4f9eff" width={150} />
      {[0,1,2].map(i => (
        <g key={i}>
          <Node x={580 + i*100} y={200} icon="📦" label={`Env-00${i+1}`} sub={`Port ${4821+i}`} color="#00ff88" width={95} height={50} />
          <Arrow x1={495} y1={360} x2={575 + i*100} y2={225} color="rgba(0,255,136,0.35)" dashed />
        </g>
      ))}
      <Node x={420} y={450} icon="🗄"  label="PostgreSQL"     sub="Per-env schema"    color="#ff8c42" width={150} />
      <Arrow x1={420} y1={385} x2={420} y2={425} color="rgba(255,140,66,0.5)" />
      <Node x={800} y={80}  icon="📊"  label="EnvPro UI"      sub="React Dashboard"   color="#ff4d6d" width={130} />
      <Arrow x1={700} y1={200} x2={750} y2={100} color="rgba(255,77,109,0.4)" dashed label="REST/WS" />
      <Node x={800} y={360} icon="⏱"  label="TTL Scheduler"  sub="Auto Cleanup"      color="#a78bfa" width={130} />
      <Arrow x1={700} y1={240} x2={750} y2={340} color="rgba(167,139,250,0.4)" dashed />
    </svg>
  );
}

function CIPipelineDiagram() {
  const stages = [
    { icon: '⎇', label: 'Git Push',    sub: 'Branch trigger',    color: '#a78bfa', x: 80 },
    { icon: '⚡', label: 'Actions',     sub: 'Workflow start',    color: '#ffd166', x: 220 },
    { icon: '⚒', label: 'Maven',       sub: 'mvn install',       color: '#00d4ff', x: 370 },
    { icon: '🧪', label: 'Unit Tests', sub: 'JUnit + Mockito',   color: '#00ff88', x: 520 },
    { icon: '🐳', label: 'Docker',     sub: 'Build image',       color: '#4f9eff', x: 660 },
    { icon: '📦', label: 'Registry',   sub: 'Push image',        color: '#ff8c42', x: 800 },
  ];
  return (
    <svg viewBox="0 0 900 180" width="100%" style={{ fontFamily: 'Inter, sans-serif' }}>
      {stages.map((s, i) => (
        <g key={i}>
          <Node x={s.x} y={90} icon={s.icon} label={s.label} sub={s.sub} color={s.color} width={120} height={60} />
          {i < stages.length - 1 && (
            <Arrow x1={s.x + 60} y1={90} x2={stages[i+1].x - 60} y2={90} color={`${s.color}60`} />
          )}
        </g>
      ))}
    </svg>
  );
}

function CDWorkflowDiagram() {
  return (
    <svg viewBox="0 0 900 340" width="100%" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Node x={100} y={60}  icon="📦" label="Docker Registry"  sub="envpro/app:sha"   color="#4f9eff" width={150} />
      <Arrow x1={100} y1={89} x2={100} y2={149} color="rgba(79,158,255,0.5)" label="pull" />
      <Node x={100} y={200} icon="🐙" label="Docker Compose"  sub="compose up -d"     color="#00d4ff" width={150} />
      <Arrow x1={100} y1={229} x2={100} y2={279} color="rgba(0,212,255,0.5)" />
      {['App:8080','Postgres:5432','Nginx:80'].map((lbl, i) => (
        <g key={i}>
          <Node x={300 + i*190} y={310} icon="📦" label={lbl} color="#00ff88" width={140} height={46} />
          <Arrow x1={175} y1={215} x2={290 + i*190} y2={295} color="rgba(0,255,136,0.35)" />
        </g>
      ))}
      <Node x={660} y={190} icon="🔀" label="Port Mapping"    sub="Host:3001→8080"   color="#ffd166" width={150} />
      <Arrow x1={300} y1={295} x2={620} y2={210} color="rgba(255,209,102,0.4)" dashed label="dynamic port" />
      <Node x={500} y={100} icon="❤️" label="Health Check"   sub="GET /actuator"     color="#00ff88" width={140} />
      <Arrow x1={300} y1={295} x2={460} y2={127} color="rgba(0,255,136,0.3)" dashed />
      <Node x={760} y={60}  icon="⏱" label="TTL Timer"       sub="3600s countdown"  color="#ff4d6d" width={140} />
      <Arrow x1={500} y1={127} x2={730} y2={72} color="rgba(255,77,109,0.4)" dashed label="on healthy" />
    </svg>
  );
}

function LifecycleDiagram() {
  const states = [
    { x: 80,  y: 200, icon: '⎇', label: 'Triggered', color: '#a78bfa' },
    { x: 220, y: 200, icon: '⚒', label: 'Building',  color: '#ffd166' },
    { x: 370, y: 200, icon: '🧪', label: 'Testing',   color: '#00d4ff' },
    { x: 520, y: 200, icon: '🚀', label: 'Deploying', color: '#4f9eff' },
    { x: 670, y: 200, icon: '✅', label: 'Running',   color: '#00ff88' },
    { x: 820, y: 200, icon: '🗑', label: 'Destroyed', color: '#4a5568' },
  ];
  return (
    <svg viewBox="0 0 920 380" width="100%" style={{ fontFamily: 'Inter, sans-serif' }}>
      {states.map((s, i) => (
        <g key={i}>
          <Node x={s.x} y={s.y} icon={s.icon} label={s.label} color={s.color} width={115} height={54} />
          {i < states.length - 1 && (
            <Arrow x1={s.x + 57} y1={s.y} x2={states[i+1].x - 57} y2={states[i+1].y} color={`${s.color}60`} />
          )}
        </g>
      ))}
      <Node x={440} y={330} icon="❌" label="Failed" color="#ff4d6d" width={115} height={54} />
      <Arrow x1={370} y1={225} x2={415} y2={305} color="rgba(255,77,109,0.5)" label="test fail" />
      <defs>
        <marker id="arcArr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="rgba(74,85,104,0.5)" />
        </marker>
      </defs>
      <path d="M 670,174 Q 745,100 820,174" fill="none" stroke="rgba(74,85,104,0.5)"
        strokeWidth="1.5" strokeDasharray="5 3" markerEnd="url(#arcArr)" />
      <text x={745} y={118} textAnchor="middle" fill="#8b9ab8" fontSize="10">TTL expired</text>
    </svg>
  );
}

function DockerDiagram() {
  return (
    <svg viewBox="0 0 900 360" width="100%" style={{ fontFamily: 'Inter, sans-serif' }}>
      <rect x={30} y={40} width={840} height={290} rx="14"
        fill="rgba(79,158,255,0.03)" stroke="rgba(79,158,255,0.15)"
        strokeWidth="1.5" strokeDasharray="6 4" />
      <text x={450} y={30} textAnchor="middle" fill="rgba(79,158,255,0.5)" fontSize="11" fontWeight="600">DOCKER HOST</text>
      <rect x={60} y={55} width={780} height={70} rx="10"
        fill="rgba(0,212,255,0.04)" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
      <text x={450} y={95} textAnchor="middle" fill="#00d4ff" fontSize="11">🔗 envpro-network (bridge)</text>
      {[[130,'App','8080','#4f9eff'],[310,'Postgres','5432','#ff8c42'],[490,'Nginx','80','#00ff88'],[670,'Redis','6379','#a78bfa']].map(([x,lbl,port,c]) => (
        <g key={lbl}>
          <Node x={x} y={230} icon="📦" label={lbl} sub={`:${port}`} color={c} width={140} height={60} />
          <line x1={x} y1={200} x2={x} y2={126} stroke={`${c}50`} strokeWidth="1.5" strokeDasharray="4 3" />
        </g>
      ))}
      <Node x={450} y={315} icon="💾" label="Shared Volume" sub="/var/envpro/data" color="#ffd166" width={160} />
      <Arrow x1={310} y1={260} x2={395} y2={300} color="rgba(255,209,102,0.35)" dashed />
      <Arrow x1={490} y1={260} x2={475} y2={300} color="rgba(255,209,102,0.35)" dashed />
    </svg>
  );
}

function UserFlowDiagram() {
  const top = [
    { x: 80,  icon: '👨‍💻', label: 'Developer',   sub: 'Writes code',   color: '#a78bfa' },
    { x: 240, icon: '⎇',   label: 'git push',   sub: 'To branch',     color: '#4f9eff' },
    { x: 420, icon: '⚡',   label: 'CI Starts',  sub: 'Auto trigger',  color: '#ffd166' },
    { x: 600, icon: '🐳',   label: 'Env Created',sub: 'Port assigned', color: '#00ff88' },
    { x: 790, icon: '👁',   label: 'Preview',    sub: 'localhost:PORT', color: '#00d4ff' },
  ];
  const btm = [
    { x: 790, icon: '🔁', label: 'Rollback',  sub: 'One-click',    color: '#ff4d6d' },
    { x: 600, icon: '✅', label: 'Approve',   sub: 'Merge PR',     color: '#a78bfa' },
    { x: 420, icon: '📊', label: 'Dashboard', sub: 'Monitor',      color: '#ff8c42' },
    { x: 240, icon: '🗑', label: 'Cleanup',   sub: 'Auto destroy', color: '#4a5568' },
  ];
  return (
    <svg viewBox="0 0 900 340" width="100%" style={{ fontFamily: 'Inter, sans-serif' }}>
      {top.map((s, i) => (
        <g key={i}>
          <Node x={s.x} y={80} icon={s.icon} label={s.label} sub={s.sub} color={s.color} width={130} height={58} />
          {i < top.length - 1 && <Arrow x1={s.x + 65} y1={80} x2={top[i+1].x - 65} y2={80} color="rgba(79,158,255,0.4)" />}
        </g>
      ))}
      <Arrow x1={790} y1={109} x2={790} y2={210} color="rgba(255,77,109,0.4)" dashed />
      {btm.map((s, i) => (
        <g key={i}>
          <Node x={s.x} y={260} icon={s.icon} label={s.label} sub={s.sub} color={s.color} width={130} height={58} />
          {i < btm.length - 1 && <Arrow x1={s.x - 65} y1={260} x2={btm[i+1].x + 65} y2={260} color="rgba(79,158,255,0.3)" />}
        </g>
      ))}
      <Arrow x1={600} y1={109} x2={600} y2={230} color="rgba(167,139,250,0.35)" dashed />
      <Arrow x1={420} y1={109} x2={420} y2={230} color="rgba(255,140,66,0.35)" dashed />
    </svg>
  );
}

function CleanupDiagram() {
  return (
    <svg viewBox="0 0 900 360" width="100%" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Node x={100} y={80}  icon="⏱" label="TTL Scheduler" sub="Every 60s"       color="#4f9eff" width={150} />
      <Arrow x1={175} y1={80} x2={265} y2={80} color="rgba(79,158,255,0.5)" />
      <Node x={370} y={80}  icon="🔍" label="TTL Check"    sub="TTL ≤ 0?"        color="#ffd166" width={165} />
      <Arrow x1={420} y1={108} x2={420} y2={168} color="rgba(255,77,109,0.5)" label="yes →" />
      <Node x={420} y={220} icon="🛑" label="Stop Compose" sub="docker compose down" color="#ff4d6d" width={165} />
      <Arrow x1={420} y1={248} x2={420} y2={308} color="rgba(255,77,109,0.5)" />
      <Node x={420} y={330} icon="🗑" label="Remove Volumes" sub="--volumes flag"  color="#ff8c42" width={165} />
      <Arrow x1={502} y1={230} x2={630} y2={175} color="rgba(167,139,250,0.4)" dashed label="log" />
      <Node x={740} y={145} icon="📝" label="Archive Logs"  sub="S3 / local"      color="#a78bfa" width={150} />
      <Arrow x1={502} y1={330} x2={650} y2={330} color="rgba(255,140,66,0.4)" />
      <Node x={770} y={330} icon="🗄" label="DB Cleanup"   sub="DROP SCHEMA env"  color="#ff8c42" width={150} />
      <Arrow x1={740} y1={170} x2={740} y2={250} color="rgba(167,139,250,0.4)" dashed />
      <Node x={740} y={275} icon="📊" label="Update UI"    sub="Status→destroyed" color="#00ff88" width={150} />
      <Arrow x1={370} y1={108} x2={200} y2={185} color="rgba(0,255,136,0.4)" label="no →" />
      <Node x={140} y={225} icon="✅" label="Keep Alive"   sub="Env still valid"  color="#00ff88" width={135} />
    </svg>
  );
}

const DIAGRAM_COMPONENTS = {
  system: SystemArchDiagram,
  ci: CIPipelineDiagram,
  cd: CDWorkflowDiagram,
  lifecycle: LifecycleDiagram,
  docker: DockerDiagram,
  user: UserFlowDiagram,
  cleanup: CleanupDiagram,
};

export default function Architecture() {
  const [active, setActive] = useState('system');
  const ActiveDiagram = DIAGRAM_COMPONENTS[active];
  const activeMeta = DIAGRAMS.find(d => d.id === active);

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
          <span className="gradient-text">Architecture Diagrams</span>
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          System design, pipeline flows, container interactions, and lifecycle diagrams
        </p>
      </motion.div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {DIAGRAMS.map(d => (
          <button key={d.id} onClick={() => setActive(d.id)} style={{
            padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s',
            background: active === d.id ? 'rgba(79,158,255,0.15)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${active === d.id ? 'var(--border-accent)' : 'var(--border-subtle)'}`,
            color: active === d.id ? 'var(--accent-blue)' : 'var(--text-secondary)',
          }}>
            {d.emoji} {d.label}
          </button>
        ))}
      </div>

      {/* Diagram Panel */}
      <AnimatePresence mode="wait">
        <motion.div key={active}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}
          className="glass-card" style={{ padding: 28 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {activeMeta?.emoji} {activeMeta?.label}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{activeMeta?.description}</div>
          </div>
          <div style={{
            background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: 20,
            border: '1px solid var(--border-subtle)', overflowX: 'auto',
          }}>
            <ActiveDiagram />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Legend */}
      <motion.div className="glass-card" style={{ padding: 16, marginTop: 16 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>Legend</div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { color: '#4f9eff', label: 'CI/CD & Infrastructure' },
            { color: '#00ff88', label: 'Active / Success' },
            { color: '#ffd166', label: 'Build Process' },
            { color: '#ff4d6d', label: 'Failure / Cleanup' },
            { color: '#a78bfa', label: 'User / Developer' },
            { color: '#ff8c42', label: 'Data / Storage' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: color, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
            <svg width="28" height="12">
              <line x1="0" y1="6" x2="28" y2="6" stroke="#8b9ab8" strokeWidth="1.5" strokeDasharray="5 3" />
            </svg>
            <span style={{ color: 'var(--text-secondary)' }}>Optional / async flow</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
