import React, { useEffect } from 'react';
import './CompanyMain.css';

interface Node {
  garden: NodeGarden;
  x: number;
  y: number;
  vx: number;
  vy: number;
  m: number;
  reset: (ref?: Partial<Node>) => void;
  addForce: (force: number, direction: { x: number; y: number }) => void;
  distanceTo: (node: Node) => { x: number; y: number; total: number };
  update: (deltaTime: number) => void;
  squaredDistanceTo: (node: Node) => number;
  collideTo: (node: Node) => void;
  render: () => void;
  getDiameter: () => number;
}

interface NodeGarden {
  nodes: Node[];
  container: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  started: boolean;
  playing: boolean;
  width: number;
  height: number;
  area: number;
  lastTime: number;
  start: () => void;
  stop: () => void;
  resize: () => void;
  render: (start?: boolean, time?: number) => void;
}

declare global {
  interface Window {
    currentNodeGarden?: NodeGarden;
    currentResizeHandler?: () => void;
  }
}

const CompanyMain: React.FC = () => {
  const handleGoBack = (): void => {
    window.history.back();
  };

  const handleStart = (): void => {
    window.location.href = '/company/register';
  };

  useEffect(() => {
    const containerName = 'nodeBackground';
    const backgroundColor = '#0a0a0a';
    const nodeColor = '#124559';
    const connectionRGB = '0,157,220';

    let active = 0;
    const checkExist = setInterval(() => {
      if (document.getElementById(containerName)) {
        if (active === 0) {
          active = 1;
          function defined<T>(a: T | null | undefined, b: T): T {
            return a != null ? a : b;
          }

          const targetFPS = 1000 / 60;

          const NodeConstructor = function(this: Node, garden: NodeGarden) {
            this.garden = garden;
            this.reset();
          } as any as new (garden: NodeGarden) => Node;

          NodeConstructor.prototype.reset = function(this: Node, ref: Partial<Node> = {}) {
            const { x, y, vx, vy, m } = ref;

            this.x = defined(x, Math.random() * this.garden.width);
            this.y = defined(y, Math.random() * this.garden.height);
            this.vx = defined(vx, Math.random() * 0.5 - 0.25);
            this.vy = defined(vy, Math.random() * 0.5 - 0.25);
            this.m = defined(m, Math.random() * 7);
          };

          NodeConstructor.prototype.addForce = function(this: Node, force: number, direction: { x: number; y: number }) {
            this.vx += force * direction.x / this.m;
            this.vy += force * direction.y / this.m;
          };

          NodeConstructor.prototype.distanceTo = function(this: Node, node: Node) {
            const x = node.x - this.x;
            const y = node.y - this.y;
            const total = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

            return {
              x: x,
              y: y,
              total: total
            };
          };

          NodeConstructor.prototype.update = function(this: Node, deltaTime: number) {
            this.x += this.vx * deltaTime / targetFPS;
            this.y += this.vy * deltaTime / targetFPS;

            if (this.x > this.garden.width + 50 || this.x < -50 || this.y > this.garden.height + 50 || this.y < -50) {
              this.reset();
            }
          };

          NodeConstructor.prototype.squaredDistanceTo = function(this: Node, node: Node) {
            return (node.x - this.x) * (node.x - this.x) + (node.y - this.y) * (node.y - this.y);
          };

          NodeConstructor.prototype.collideTo = function(this: Node, node: Node) {
            node.vx = node.m * node.vx / (this.m + node.m) + this.m * this.vx / (this.m + node.m);
            node.vy = node.m * node.vy / (this.m + node.m) + this.m * this.vy / (this.m + node.m);
            this.reset();
          };

          NodeConstructor.prototype.render = function(this: Node) {
            this.garden.ctx.beginPath();
            const innerRadius = this.getDiameter()/8;
            const outerRadius = this.getDiameter();
            const gradient = this.garden.ctx.createRadialGradient(this.x, this.y, innerRadius, this.x, this.y, outerRadius);
            gradient.addColorStop(1, backgroundColor);
            gradient.addColorStop(0, nodeColor);
            this.garden.ctx.arc(this.x, this.y, outerRadius, 0, 2 * Math.PI);
            this.garden.ctx.fillStyle = gradient;
            this.garden.ctx.fill();
          };

          NodeConstructor.prototype.getDiameter = function(this: Node) {
            return this.m;
          };

          const devicePixelRatio = window.devicePixelRatio || 1;
          const requestAnimationFrame = window.requestAnimationFrame;

          const NodeGardenConstructor = function(this: NodeGarden, container: HTMLElement) {
            this.nodes = [];
            this.container = container;
            this.canvas = document.createElement('canvas');
            const ctx = this.canvas.getContext('2d');
            if (!ctx) throw new Error('Canvas context not available');
            this.ctx = ctx;
            this.started = false;

            if (devicePixelRatio && (devicePixelRatio !== 1)) {
              this.canvas.style.transform = 'scale(' + 1 / devicePixelRatio + ')';
              this.canvas.style.transformOrigin = '0 0';
            }
            this.canvas.id = 'nodegarden';

            this.container.appendChild(this.canvas);
            this.resize();
          } as any as new (container: HTMLElement) => NodeGarden;

          NodeGardenConstructor.prototype.start = function(this: NodeGarden) {
            if (!this.playing) {
              this.playing = true;
              this.render(true);
            }
          };

          NodeGardenConstructor.prototype.stop = function(this: NodeGarden) {
            if (this.playing) {
              this.playing = false;
            }
          };

          NodeGardenConstructor.prototype.resize = function(this: NodeGarden) {
            this.width = this.container.clientWidth * devicePixelRatio;
            this.height = this.container.clientHeight * devicePixelRatio;
            this.area = this.width * this.height;

            this.nodes.length = Math.sqrt(this.area) / 10 | 0;

            this.canvas.width = this.width;
            this.canvas.height = this.height;

            this.ctx.fillStyle = nodeColor;

            for (let i = 0; i < this.nodes.length; i++) {
              if (this.nodes[i]) {
                continue;
              }
              this.nodes[i] = new NodeConstructor(this);
            }
          };

          NodeGardenConstructor.prototype.render = function(this: NodeGarden, start?: boolean, time?: number) {
            const self = this;

            if (!this.playing) {
              return;
            }

            if (start) {
              requestAnimationFrame((time: number) => {
                self.render(true, time);
              });
            }

            const deltaTime = time! - (this.lastTime || time!);
            this.lastTime = time!;

            this.ctx.clearRect(0, 0, this.width, this.height);

            for (let i = 0; i < this.nodes.length - 1; i++) {
              const nodeA = this.nodes[i];
              for (let j = i + 1; j < this.nodes.length; j++) {
                const nodeB = this.nodes[j];
                const squaredDistance = nodeA.squaredDistanceTo(nodeB);

                const force = 0.4 * (nodeA.m * nodeB.m) / squaredDistance;
                const opacity = force * 100;

                if (opacity < 0.025) {
                  continue;
                }

                if (squaredDistance <= (nodeA.m / 2 + nodeB.m / 2) * (nodeA.m / 2 + nodeB.m / 2)) {
                  if (nodeA.m <= nodeB.m) {
                    nodeA.collideTo(nodeB);
                  } else {
                    nodeB.collideTo(nodeA);
                  }
                  continue;
                }

                const distance = nodeA.distanceTo(nodeB);

                const direction = {
                  x: distance.x / distance.total,
                  y: distance.y / distance.total
                };

                this.ctx.beginPath();
                this.ctx.strokeStyle = 'rgba('+connectionRGB+',' + (opacity < 1 ? opacity : 1) + ')';
                this.ctx.moveTo(nodeA.x, nodeA.y);
                this.ctx.lineTo(nodeB.x, nodeB.y);
                this.ctx.stroke();

                nodeA.addForce(force, direction);
                nodeB.addForce(-force, direction);
              }
            }

            for (let i = 0; i < this.nodes.length; i++) {
              this.nodes[i].render();
              this.nodes[i].update(deltaTime || 0);
            }
          };

          const $container = document.getElementById(containerName)!;
          const nodeGarden = new NodeGardenConstructor($container);

          nodeGarden.start();

          const handleResize = () => {
            nodeGarden.resize();
          };

          window.addEventListener('resize', handleResize);

          // Store nodeGarden for cleanup
          window.currentNodeGarden = nodeGarden;
          window.currentResizeHandler = handleResize;
        }
        clearInterval(checkExist);
      }
    }, 100);

    // Cleanup function
    return () => {
      if (window.currentNodeGarden) {
        window.currentNodeGarden.stop();
        window.currentNodeGarden = undefined;
      }
      if (window.currentResizeHandler) {
        window.removeEventListener('resize', window.currentResizeHandler);
        window.currentResizeHandler = undefined;
      }
      clearInterval(checkExist);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div id="nodeBackground" style={{ width: '100%', height: '100%' }}></div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        color: 'white',
        zIndex: 10
      }}>
        <h1 className="fade-in-title">CodeFIT</h1>
        <p className="fade-in-subtitle">최고의 개발 인재를 가장 스마트하게 만나는 방법</p>
        <div className="company-buttons fade-in-buttons">
          <button className="company-btn company-btn-back" onClick={handleGoBack}>
            뒤로가기
          </button>
          <button className="company-btn company-btn-start" onClick={handleStart}>
            시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanyMain;