import type { SubjectNotes, Note } from './types';
import { TREES } from './index';

// Bodies use String.raw so LaTeX backslashes survive. Never put ` or ${ inside.
const r = String.raw;

const N: Note[] = [
  // ───────────────────────────── MECHANICS ─────────────────────────────
  {
    id: 'kinematics',
    core: {
      en: 'Velocity is how fast position changes; acceleration is how fast velocity changes. If acceleration is constant, three formulas describe everything — and a projectile is just two of these motions (constant vₓ, free fall in y) running side by side.',
      ja: '速度は位置の変化の速さ、加速度は速度の変化の速さ。加速度が一定なら3つの公式で全部表せる。放物運動は「水平は等速、鉛直は自由落下」の2つを同時に見るだけ。',
    },
    body: {
      en: r`## The three constant-acceleration formulas
| formula | use it when you… |
|---|---|
| $v = v_0 + at$ | know time, want velocity |
| $x = v_0 t + \tfrac12 a t^2$ | know time, want distance |
| $v^2 - v_0^2 = 2ax$ | do **not** know time |

Sign rule: choose a positive direction first. Anything pointing the other way (usually $g$ for upward throws) gets a minus sign. Do this before writing any formula.

## Reading graphs (very common)
- **v–t graph**: slope = acceleration, **area = displacement**.
- **x–t graph**: slope = velocity.
- **a–t graph**: area = change in velocity.

## Free fall and throws
Take up as positive: $a = -g$. For a ball thrown up at $v_0$: highest point when $v=0$ → $t = v_0/g$, height $h = v_0^2/2g$. It comes back to the throw height with speed $v_0$ after $2v_0/g$.

## Projectile motion
:::fig projectile

Horizontal: $x = v_0\cos\theta\, t$ (no force, so no acceleration).
Vertical: $y = v_0\sin\theta\, t - \tfrac12 g t^2$, $v_y = v_0\sin\theta - gt$.
- Time of flight (same height): $T = 2v_0\sin\theta/g$.
- Range: $R = v_0^2\sin 2\theta/g$ → max at 45°.
- Max height: $H = v_0^2\sin^2\theta/2g$.
- At the top $v_y = 0$ but $v_x \neq 0$ — the speed is **not** zero.

## Relative motion
Velocity of A seen from B: $\vec v_{AB} = \vec v_A - \vec v_B$ ("A minus the observer"). Rain that falls vertically looks slanted toward you when you walk — draw the vector triangle.`,
      ja: r`## 等加速度運動の3公式
| 公式 | 使う場面 |
|---|---|
| $v = v_0 + at$ | 時間がわかっていて速度が欲しい |
| $x = v_0 t + \tfrac12 a t^2$ | 時間がわかっていて距離が欲しい |
| $v^2 - v_0^2 = 2ax$ | 時間が**わからない** |

符号のルール：まず正の向きを決める。逆向きのもの（上向きに投げたときの $g$ など）にはマイナスをつける。公式を書く前にこれをやる。

## グラフの読み方（頻出）
- **v–t グラフ**：傾き = 加速度、**面積 = 変位**。
- **x–t グラフ**：傾き = 速度。
- **a–t グラフ**：面積 = 速度の変化。

## 自由落下と投げ上げ
上向きを正にすると $a = -g$。初速 $v_0$ で投げ上げると、最高点では $v=0$ → $t = v_0/g$、高さ $h = v_0^2/2g$。$2v_0/g$ 後に同じ高さへ速さ $v_0$ で戻る。

## 放物運動
:::fig projectile

水平：$x = v_0\cos\theta\, t$（力がないので加速度なし）。
鉛直：$y = v_0\sin\theta\, t - \tfrac12 g t^2$、$v_y = v_0\sin\theta - gt$。
- 滞空時間（同じ高さ）：$T = 2v_0\sin\theta/g$。
- 水平到達距離：$R = v_0^2\sin 2\theta/g$ → 45° で最大。
- 最高点の高さ：$H = v_0^2\sin^2\theta/2g$。
- 最高点で $v_y = 0$ でも $v_x \neq 0$。速さは**0ではない**。

## 相対運動
B から見た A の速度：$\vec v_{AB} = \vec v_A - \vec v_B$（「A 引く 観測者」）。まっすぐ落ちる雨は歩くと自分の方へ斜めに見える。ベクトルの三角形を描く。`,
    },
    exam: {
      en: ['Read a v–t graph: find displacement (area) or the time two objects meet.', 'Projectile from a cliff or at an angle: time to land, range, or the speed at a given height (use energy or $v^2$ formula).', 'Two bodies thrown at different times: set up $x_1(t) = x_2(t)$.'],
      ja: ['v–t グラフを読む：変位（面積）や2物体が出会う時刻を求める。', '崖の上や斜めからの投射：着地時間、到達距離、ある高さでの速さ（エネルギーか $v^2$ の式）。', '時間差で投げた2物体：$x_1(t) = x_2(t)$ を立てる。'],
    },
    traps: {
      en: ['Distance travelled ≠ displacement when the object turns around (ball thrown up).', 'Average velocity for constant acceleration is $(v_0+v)/2$, **not** $v/2$ unless $v_0 = 0$.', 'At the top of a projectile the acceleration is still $g$ downward — nothing "pauses".'],
      ja: ['向きを変える運動（投げ上げ）では 道のり ≠ 変位。', '等加速度の平均速度は $(v_0+v)/2$。$v_0=0$ のときだけ $v/2$。', '放物運動の最高点でも加速度は下向き $g$ のまま。何も「止まらない」。'],
    },
    followups: {
      en: ['Why is the area under a v–t graph the displacement?', 'Show me how to pick the sign convention for a ball thrown upward.', 'Why is the range largest at 45°?', 'Give me one EJU-style projectile problem and walk me through it.'],
      ja: ['なぜ v–t グラフの面積が変位になるの？', '投げ上げの符号の決め方を見せて。', 'なぜ到達距離は 45° で最大？', 'EJU風の放物運動の問題を1問出して解説して。'],
    },
  },
  {
    id: 'forces',
    core: {
      en: 'Every force in the EJU comes from a short list: gravity, normal force, tension, friction, spring force, buoyancy (and pressure). Learn what each one is, which way it points, and what it equals — then any problem is just "list the forces, then use ΣF = ma or ΣF = 0".',
      ja: 'EJUに出る力は少数：重力・垂直抗力・張力・摩擦力・弾性力・浮力（と圧力）。それぞれの向きと大きさを覚えれば、あとは「力を全部書き出して ΣF = ma か ΣF = 0」にするだけ。',
    },
    body: {
      en: r`## The force menu
| force | direction | size |
|---|---|---|
| gravity $mg$ | straight down | $mg$ |
| normal force $N$ | perpendicular to the surface, pushing away | whatever keeps the body from sinking in (solve for it!) |
| tension $T$ | along the string, pulling | same at both ends of a light string |
| static friction | along the surface, opposing the *tendency* to slide | up to $\mu N$ |
| kinetic friction | opposing the motion | exactly $\mu' N$ |
| spring $F=kx$ | toward the natural length | $kx$ ($x$ = stretch or compression) |
| buoyancy | up | weight of displaced fluid $\rho V g$ |

## Two rules that solve most "force" questions
1. **Normal force is not always $mg$.** On a slope it is $mg\cos\theta$; if something pushes down it grows; in an accelerating lift it changes. Always solve for $N$ from the perpendicular direction.
2. **Friction is a responder.** Static friction is only as big as it needs to be (up to $\mu N$). Kinetic friction is fixed at $\mu' N$ and always opposes sliding.

## Pressure and buoyancy
Pressure in a fluid at depth $h$: $p = p_0 + \rho g h$. Buoyancy = $\rho_{fluid} V_{submerged}\, g$ — the object's own mass does not appear. Floating: buoyancy = weight, so $\rho_{fluid} V_{sub} = \rho_{obj} V_{obj}$.

## Springs in series and parallel
Series (end to end): $\frac{1}{k} = \frac{1}{k_1} + \frac{1}{k_2}$ (softer). Parallel (side by side): $k = k_1 + k_2$ (stiffer).`,
      ja: r`## 力のメニュー
| 力 | 向き | 大きさ |
|---|---|---|
| 重力 $mg$ | 鉛直下向き | $mg$ |
| 垂直抗力 $N$ | 面に垂直、押し返す向き | 物体がめり込まないだけの大きさ（**求める**もの） |
| 張力 $T$ | 糸に沿って引く向き | 軽い糸なら両端で同じ |
| 静止摩擦力 | 面に沿って、滑ろうとする向きの逆 | 最大 $\mu N$ まで |
| 動摩擦力 | 運動の逆向き | ちょうど $\mu' N$ |
| 弾性力 $F=kx$ | 自然長に戻す向き | $kx$（$x$ = 伸びまたは縮み） |
| 浮力 | 上向き | 押しのけた流体の重さ $\rho V g$ |

## 「力」の問題の大半を解く2つのルール
1. **垂直抗力はいつも $mg$ ではない。** 斜面では $mg\cos\theta$、上から押されれば大きくなる、加速するエレベーターでは変わる。必ず面に垂直な方向の式から $N$ を求める。
2. **摩擦力は「応じる」力。** 静止摩擦力は必要な分だけ（最大 $\mu N$）。動摩擦力は $\mu' N$ で固定、常に滑りの逆向き。

## 圧力と浮力
深さ $h$ での圧力：$p = p_0 + \rho g h$。浮力 = $\rho_{流体} V_{沈んだ部分}\, g$。物体自身の質量は出てこない。浮いているとき 浮力 = 重力 なので $\rho_{流体} V_{沈} = \rho_{物体} V_{物体}$。

## ばねの直列・並列
直列（つなぐ）：$\frac{1}{k} = \frac{1}{k_1} + \frac{1}{k_2}$（やわらかくなる）。並列（並べる）：$k = k_1 + k_2$（かたくなる）。`,
    },
    exam: {
      en: ['Which diagram correctly shows all forces on a block on a slope / a hanging mass / a floating object?', 'A block is pushed against a wall: find the minimum push so it does not slide (friction $\\mu N$ with $N$ = push).', 'Floating body: what fraction is submerged? ($\\rho_{obj}/\\rho_{fluid}$)'],
      ja: ['斜面上の物体・つるした物体・浮いている物体にはたらく力を正しく描いた図を選ぶ。', '壁に押しつけた物体が滑らない最小の力（摩擦 $\\mu N$、$N$ = 押す力）。', '浮いている物体の沈んでいる割合（$\\rho_{物体}/\\rho_{流体}$）。'],
    },
    traps: {
      en: ['"Maximum static friction" $\\mu N$ is only reached at the moment of slipping. Before that, friction = whatever balances the other forces.', 'Tension in a string over a pulley is the same on both sides only if the pulley is light and frictionless.', 'Buoyancy depends on the **fluid** density and the **submerged** volume, never on the object\'s weight.'],
      ja: ['「最大静止摩擦力」$\\mu N$ になるのは滑り出す瞬間だけ。それまでは他の力とつり合う大きさ。', '滑車をかけた糸の張力が両側で等しいのは、滑車が軽くてなめらかなときだけ。', '浮力は**流体**の密度と**沈んでいる**体積で決まり、物体の重さとは無関係。'],
    },
    followups: {
      en: ['Why is the normal force on a slope mg cos θ and not mg?', 'How do I decide the direction of static friction?', 'Explain buoyancy with a real-number example.', 'When does a spring in series become softer — show me why with two identical springs.'],
      ja: ['なぜ斜面の垂直抗力は mg cos θ で mg ではないの？', '静止摩擦力の向きはどう決める？', '浮力を具体的な数値で説明して。', '直列のばねがやわらかくなる理由を同じばね2本で示して。'],
    },
  },
  {
    id: 'force-equilibrium',
    core: {
      en: 'A body at rest (or moving at constant velocity) has zero net force. Resolve every force into two perpendicular directions and write "sum = 0" in each. Three forces in equilibrium always form a closed triangle.',
      ja: '静止（または等速直線運動）している物体にはたらく力の合力は0。すべての力を直交する2方向に分解し、それぞれで「和 = 0」を書く。つり合う3力は必ず閉じた三角形になる。',
    },
    body: {
      en: r`## Method
1. Draw the body alone and every force on it (only forces **on** this body).
2. Pick two perpendicular axes — usually along and across a slope, or horizontal and vertical.
3. Resolve angled forces: a force $F$ at angle $\theta$ to an axis gives $F\cos\theta$ along it and $F\sin\theta$ across it.
4. Write $\sum F_x = 0$ and $\sum F_y = 0$. Two equations, so you can find two unknowns (typically $T$ and $N$, or $T_1$ and $T_2$).

## Three-force triangle (fast route)
If exactly three forces balance, they can be drawn head-to-tail as a closed triangle. Angles in the triangle are the angles between the forces. For a lamp held by two strings at angles $\alpha$ and $\beta$ to the ceiling, the sine rule gives $T_1/\sin\beta = T_2/\sin\alpha = mg/\sin(\alpha+\beta)$ — no components needed.

## Worked pattern: block on a rough slope, about to slip
Along the slope: $mg\sin\theta = \mu N$. Across: $N = mg\cos\theta$. Divide: $\mu = \tan\theta$. The **angle of repose** depends only on $\mu$, not on the mass.

## Resultant of two forces
$|\vec F_1 + \vec F_2|^2 = F_1^2 + F_2^2 + 2F_1F_2\cos\phi$ where $\phi$ is the angle between them. Same size, 120° apart → resultant equals each force; 90° apart → $\sqrt2 F$.`,
      ja: r`## 手順
1. 物体だけを描き、その物体に**はたらく**力を全部かく（他の物体にはたらく力は書かない）。
2. 直交する2軸を決める。ふつうは斜面に沿う方向と垂直方向、または水平と鉛直。
3. 斜めの力を分解：軸と角 $\theta$ をなす力 $F$ は、軸方向 $F\cos\theta$、垂直方向 $F\sin\theta$。
4. $\sum F_x = 0$、$\sum F_y = 0$ を書く。式が2本なので未知数2つ（$T$ と $N$、または $T_1$ と $T_2$）が求まる。

## 3力の三角形（速い方法）
ちょうど3つの力がつり合うなら、矢印をつないで閉じた三角形にできる。三角形の角は力どうしの角。天井から角 $\alpha$、$\beta$ の2本の糸でつるした物体なら、正弦定理で $T_1/\sin\beta = T_2/\sin\alpha = mg/\sin(\alpha+\beta)$。分解不要。

## 定番：粗い斜面で滑り出す直前の物体
斜面方向：$mg\sin\theta = \mu N$。垂直方向：$N = mg\cos\theta$。割ると $\mu = \tan\theta$。滑り出す角度は $\mu$ だけで決まり、質量によらない。

## 2力の合力
$|\vec F_1 + \vec F_2|^2 = F_1^2 + F_2^2 + 2F_1F_2\cos\phi$（$\phi$ はなす角）。同じ大きさで 120° → 合力は各力と同じ大きさ、90° → $\sqrt2 F$。`,
    },
    exam: {
      en: ['Mass hung by two strings at given angles: find each tension (symbolic).', 'Block held on a smooth slope by a horizontal force or a force along the slope: find $F$ and $N$.', 'Minimum coefficient of friction so a ladder / block does not slip.'],
      ja: ['角度の与えられた2本の糸でつるした物体：各張力（文字式）。', 'なめらかな斜面上で水平力または斜面方向の力で支えた物体：$F$ と $N$。', 'はしごや物体が滑らないための最小の摩擦係数。'],
    },
    traps: {
      en: ['A horizontal push $F$ on a slope has a component $F\\sin\\theta$ **into** the slope, so $N = mg\\cos\\theta + F\\sin\\theta$ — it changes $N$.', 'Equilibrium also holds for constant-velocity motion, not just rest.', 'Do not put the reaction force (Newton\'s third law partner) on the same diagram — it acts on the other body.'],
      ja: ['斜面上の物体を水平に押す力 $F$ には斜面に**押しつける**成分 $F\\sin\\theta$ があり、$N = mg\\cos\\theta + F\\sin\\theta$ になる。', 'つり合いは静止だけでなく等速直線運動でも成り立つ。', '作用・反作用の相手の力を同じ図に描かない。それは別の物体にはたらく力。'],
    },
    followups: {
      en: ['Why can three balanced forces be drawn as a triangle?', 'Walk me through resolving a force at 30° with actual numbers.', 'Why does the angle of repose not depend on mass?', 'Give me a two-string tension problem to try, then check my answer.'],
      ja: ['なぜつり合う3力は三角形に描けるの？', '30° の力の分解を実際の数値でやって見せて。', 'なぜ滑り出す角度は質量によらないの？', '2本の糸の張力の問題を出して、答えを確認して。'],
    },
  },
  {
    id: 'rigid-body',
    core: {
      en: 'A rigid body needs two conditions to stay still: forces balance (no translation) AND torques balance about any point (no rotation). Torque = force × perpendicular distance to the pivot. Pick the pivot where an unknown force acts, and that unknown disappears.',
      ja: '剛体が静止するには「力のつり合い（並進しない）」と「任意の点まわりのモーメントのつり合い（回転しない）」の両方が必要。モーメント = 力 × 支点からの垂直距離。未知の力がはたらく点を支点に選べば、その未知数が消える。',
    },
    body: {
      en: r`## Torque (moment of force)
:::fig torque

$\tau = F \times d_\perp$, where $d_\perp$ is the **perpendicular** distance from the pivot to the line of the force. Equivalently $\tau = Fd\sin\theta$. Sign: anticlockwise positive (or just write "clockwise total = anticlockwise total").

## Conditions for equilibrium
1. $\sum \vec F = 0$
2. $\sum \tau = 0$ about **any** point (if forces balance, the choice of point does not matter).

**Trick:** take moments about the point where the most unknown forces act. A ladder against a smooth wall: take moments about the foot, and both floor forces vanish from the equation.

## Centre of mass
$x_G = \dfrac{m_1x_1 + m_2x_2 + \cdots}{m_1 + m_2 + \cdots}$. For a uniform rod it is the midpoint; for an L-shape or a plate with a hole, treat the hole as **negative mass**. A body tips over when the vertical line through $G$ leaves the base of support.

## Couple
Two equal, opposite, parallel forces separated by $d$: net force zero, torque $Fd$ about **every** point. A couple can only be balanced by another couple.

## Classic: beam on two supports
Uniform beam of weight $W$, length $L$, supports at the ends, extra load $P$ at distance $a$ from the left. Moments about the left end: $N_R L = W\cdot\frac{L}{2} + P a$. Then $N_L = W + P - N_R$. Which support gives zero force when the load slides toward the end? — the moment equation tells you directly.`,
      ja: r`## 力のモーメント
:::fig torque

$\tau = F \times d_\perp$。$d_\perp$ は支点から力の作用線までの**垂直**距離。$\tau = Fd\sin\theta$ とも書ける。符号は反時計回りを正（または「時計回りの合計 = 反時計回りの合計」と書く）。

## 剛体のつり合いの条件
1. $\sum \vec F = 0$
2. **任意の**点まわりで $\sum \tau = 0$（力がつり合っていれば点の選び方は自由）。

**コツ：**未知の力がいちばん多くはたらく点のまわりでモーメントをとる。なめらかな壁に立てかけたはしごなら、床との接点まわりでとると床からの2つの力が式から消える。

## 重心
$x_G = \dfrac{m_1x_1 + m_2x_2 + \cdots}{m_1 + m_2 + \cdots}$。一様な棒なら中点。L字形や穴のあいた板は、穴を**負の質量**として扱う。$G$ を通る鉛直線が支持面から外れると倒れる。

## 偶力
大きさが等しく逆向きの平行な2力（間隔 $d$）：合力は0、モーメントは**どの点まわりでも** $Fd$。偶力は偶力でしかつり合わせられない。

## 定番：2つの支点にのせた棒
重さ $W$、長さ $L$ の一様な棒を両端で支え、左端から $a$ の位置におもり $P$。左端まわりのモーメント：$N_R L = W\cdot\frac{L}{2} + P a$。あとは $N_L = W + P - N_R$。おもりを端へ動かしたときどちらの支点の力が0になるか — モーメントの式がそのまま答える。`,
    },
    exam: {
      en: ['Rod hinged at one end, held by a string: find the string tension using moments about the hinge.', 'Find the centre of mass of an L-shaped plate or a rod with two masses.', 'Where can a load be placed on a beam before it tips? (support force becomes zero).'],
      ja: ['一端を蝶番で固定し糸で支えた棒：蝶番まわりのモーメントで張力を求める。', 'L字形の板や2つのおもりをつけた棒の重心。', '棒が傾く直前までおもりをどこまで置けるか（支点の力が0になる）。'],
    },
    traps: {
      en: ['Use the **perpendicular** distance, not the distance along the rod, when the force is not perpendicular to the rod.', 'The weight of a uniform rod acts at its centre — include it even if the question does not mention it explicitly.', 'A smooth wall can only push perpendicular to itself (no friction component).'],
      ja: ['力が棒に垂直でないときは、棒に沿った距離ではなく**垂直**距離を使う。', '一様な棒の重さは中央にはたらく。問題文に書かれていなくても忘れずに入れる。', 'なめらかな壁は壁に垂直にしか押せない（摩擦成分なし）。'],
    },
    followups: {
      en: ['Why can I take moments about any point when the forces balance?', 'Show the ladder-against-a-wall problem step by step.', 'How do I find the centre of mass of a plate with a hole?', 'Why does a couple have the same torque about every point?'],
      ja: ['力がつり合っていればなぜどの点まわりでモーメントをとってもいいの？', '壁に立てかけたはしごの問題を順を追って見せて。', '穴のあいた板の重心はどう求める？', 'なぜ偶力のモーメントはどの点まわりでも同じなの？'],
    },
  },
  {
    id: 'newtons-laws',
    core: {
      en: 'Net force causes acceleration: ΣF = ma. Write one equation per body, along the direction of motion, using the same acceleration for bodies tied together. Third law: forces come in equal-and-opposite pairs acting on different bodies.',
      ja: '合力が加速度を生む：ΣF = ma。物体ごとに運動方向の式を1本ずつ書き、つながった物体は同じ加速度を使う。作用反作用：力は必ず「別の物体に」はたらく等大逆向きのペア。',
    },
    body: {
      en: r`## The three laws in one line each
1. **Inertia**: no net force → velocity stays constant (including zero).
2. **$\sum \vec F = m\vec a$**: acceleration is in the direction of the *net* force. Unit: 1 N = 1 kg·m/s².
3. **Action–reaction**: if A pushes B with $F$, B pushes A with $F$ the other way. The two forces act on **different** bodies, so they never cancel each other in one body's equation.

## Recipe for equations of motion
1. Decide the positive direction (the direction things will accelerate).
2. For **each body**, write $ma = $ (forces along +) − (forces along −).
3. Connected by a taut string / in contact → same $|a|$.
4. Solve the simultaneous equations. The tension or contact force is an **internal** force: it appears in both equations with opposite signs and cancels when you add them.

## Two classic set-ups
**Atwood machine** (masses $M > m$ over a light pulley): add the equations → $a = \dfrac{(M-m)g}{M+m}$, then $T = \dfrac{2Mm}{M+m}g$.

**Blocks in contact** pushed by $F$ on a smooth floor ($m_A$ pushed, pushing $m_B$): whole system $a = F/(m_A+m_B)$; contact force on B is $m_B a = \dfrac{m_B}{m_A+m_B}F$ — B only needs enough push to accelerate **itself**.

**Mass on a slope tied to a hanging mass** over a pulley: along the slope the pull is $m_1 g\sin\theta$; the hanging mass pulls with $m_2 g$. Sign each one, add.

## Units and dimensions
Check any formula by dimensions: $[F] = \mathrm{M\,L\,T^{-2}}$, $[E] = \mathrm{M\,L^2\,T^{-2}}$, $[p] = \mathrm{M\,L\,T^{-1}}$. A dimension check catches most algebra slips.`,
      ja: r`## 3法則を1行ずつ
1. **慣性の法則**：合力0 → 速度は一定（0を含む）。
2. **$\sum \vec F = m\vec a$**：加速度は*合力*の向き。単位 1 N = 1 kg·m/s²。
3. **作用・反作用**：A が B を $F$ で押せば、B は A を逆向きに $F$ で押す。2つの力は**別の**物体にはたらくので、1つの物体の式の中で打ち消し合うことはない。

## 運動方程式のレシピ
1. 正の向き（加速する向き）を決める。
2. **物体ごとに** $ma = $（正の向きの力）−（負の向きの力）を書く。
3. ピンと張った糸でつながっている・接触している → 同じ $|a|$。
4. 連立して解く。張力や接触力は**内力**：両方の式に逆符号で現れ、足すと消える。

## 定番2つ
**アトウッドの器械**（軽い滑車に $M > m$）：式を足して $a = \dfrac{(M-m)g}{M+m}$、$T = \dfrac{2Mm}{M+m}g$。

**接触した2物体**をなめらかな床で $F$ で押す（$m_A$ を押し、$m_A$ が $m_B$ を押す）：全体 $a = F/(m_A+m_B)$。B が受ける力は $m_B a = \dfrac{m_B}{m_A+m_B}F$。B は**自分を**加速させる分だけ押されればよい。

**斜面上の物体と滑車越しにつるしたおもり**：斜面方向の引く力は $m_1 g\sin\theta$、おもりは $m_2 g$ で引く。符号をつけて足す。

## 単位と次元
式は次元で確認：$[F] = \mathrm{M\,L\,T^{-2}}$、$[E] = \mathrm{M\,L^2\,T^{-2}}$、$[p] = \mathrm{M\,L\,T^{-1}}$。次元チェックで計算ミスの大半が見つかる。`,
    },
    exam: {
      en: ['Two blocks in contact or connected over a pulley on an incline: acceleration and contact force / tension as a fraction of $g$ or $F$ (very frequent, block I).', 'Reading the ratio of contact forces when the push is applied from the other side.', 'Which pair of forces is an action–reaction pair? (choose from a diagram).'],
      ja: ['斜面上で接触した2物体や滑車でつないだ2物体：加速度と接触力・張力を $g$ や $F$ の式で（大問 I で頻出）。', '反対側から押したときの接触力の比。', '作用・反作用のペアはどれか（図から選ぶ）。'],
    },
    traps: {
      en: ['Weight $mg$ and normal force $N$ are **not** an action–reaction pair (both act on the same body). The partner of $mg$ is the body pulling the Earth.', 'In a pulley system the tension is one unknown; do not give it different names on the two sides of a light string.', 'The system trick ($a = F/M_{total}$) works only when the bodies really share the same acceleration.'],
      ja: ['重力 $mg$ と垂直抗力 $N$ は作用・反作用の**ペアではない**（同じ物体にはたらく）。$mg$ の相手は物体が地球を引く力。', '滑車の問題で張力は1つの未知数。軽い糸の両側で別の名前をつけない。', '全体で $a = F/M_{全体}$ とする技は、全部が本当に同じ加速度のときだけ。'],
    },
    followups: {
      en: ['Why does the contact force between two pushed blocks depend on which block is pushed?', 'Show me the Atwood machine derivation slowly.', 'What is the reaction to the weight of a book on a table?', 'Give me a pulley-on-incline problem and check my equations.'],
      ja: ['2物体を押すとき、接触力がどちらを押すかで変わるのはなぜ？', 'アトウッドの器械の導出をゆっくり見せて。', '机の上の本の重力の反作用は何？', '斜面と滑車の問題を出して、私の立てた式を確認して。'],
    },
  },
  {
    id: 'friction-resistance',
    core: {
      en: 'Friction is decided by the situation: at rest it matches the other forces (up to μN); once sliding it is μ′N and always opposes motion. Air resistance grows with speed, so a falling body stops accelerating at the terminal velocity where drag = weight.',
      ja: '摩擦力は状況で決まる：静止中は他の力に合わせる（最大 μN）、滑り出すと μ′N で常に運動の逆向き。空気抵抗は速さとともに増えるので、落下する物体は「抵抗 = 重力」の終端速度で加速をやめる。',
    },
    body: {
      en: r`## Static vs kinetic friction
:::fig incline-fbd

| | static (not sliding) | kinetic (sliding) |
|---|---|---|
| size | as needed, **up to** $\mu N$ | exactly $\mu' N$ |
| direction | opposes the way it *would* slide | opposes the sliding |
| typical use | "will it move?" tests | deceleration $a = \mu' g$ on a flat floor |

Usually $\mu' < \mu$: it takes more force to start sliding than to keep sliding.

## Decision procedure ("does it slide?")
1. Assume it does **not** slide and compute the friction $f$ needed for equilibrium.
2. Compare with $\mu N$. If $f \le \mu N$ → stays (friction = $f$). If $f > \mu N$ → slides; now use $\mu' N$ and $\sum F = ma$.

## Sliding on a slope
Down a rough slope: $ma = mg\sin\theta - \mu' mg\cos\theta$ → $a = g(\sin\theta - \mu'\cos\theta)$. Up the slope (moving up): $a = -g(\sin\theta + \mu'\cos\theta)$ — both gravity and friction slow it. Distance to stop: $v^2 = 2 a d$.

## Energy view
Kinetic friction converts mechanical energy into heat: $\mu' N \times (\text{distance}) = $ energy lost. Great for "how far does it slide?" questions.

## Air resistance and terminal velocity
Drag $= kv$ (slow) or $kv^2$ (fast), always opposite to velocity. Falling: $ma = mg - kv$. Acceleration shrinks as $v$ grows; when $kv = mg$, $a = 0$ → **terminal velocity** $v_t = mg/k$. On a v–t graph the curve rises with decreasing slope and flattens at $v_t$.`,
      ja: r`## 静止摩擦と動摩擦
:::fig incline-fbd

| | 静止摩擦（滑っていない） | 動摩擦（滑っている） |
|---|---|---|
| 大きさ | 必要な分だけ、**最大** $\mu N$ | ちょうど $\mu' N$ |
| 向き | 滑ろうとする向きの逆 | 滑る向きの逆 |
| 使いどころ | 「動くか？」の判定 | 水平面上の減速 $a = \mu' g$ |

ふつう $\mu' < \mu$：滑り出すより滑り続ける方が小さい力ですむ。

## 判定の手順（「滑るか？」）
1. 滑ら**ない**と仮定して、つり合いに必要な摩擦力 $f$ を計算。
2. $\mu N$ と比べる。$f \le \mu N$ → 静止（摩擦力 = $f$）。$f > \mu N$ → 滑る。以後は $\mu' N$ と $\sum F = ma$。

## 斜面を滑る
粗い斜面を下る：$ma = mg\sin\theta - \mu' mg\cos\theta$ → $a = g(\sin\theta - \mu'\cos\theta)$。上向きに運動中：$a = -g(\sin\theta + \mu'\cos\theta)$。重力も摩擦も減速させる。止まるまでの距離：$v^2 = 2 a d$。

## エネルギーで見る
動摩擦は力学的エネルギーを熱に変える：$\mu' N \times (\text{距離}) = $ 失われたエネルギー。「どこまで滑るか」に最適。

## 空気抵抗と終端速度
抵抗 $= kv$（遅い）または $kv^2$（速い）、常に速度の逆向き。落下：$ma = mg - kv$。$v$ が増えると加速度は減り、$kv = mg$ で $a = 0$ → **終端速度** $v_t = mg/k$。v–t グラフは傾きが減りながら上がり、$v_t$ で水平になる。`,
    },
    exam: {
      en: ['Block on a slope with $\\mu$: does it stay? If it slides, its acceleration or stopping distance.', 'After a collision, bodies slide different distances on a rough floor: distance ratio ∝ $v^2$ (combine with restitution).', 'Terminal velocity: read $v_t$ from the equation $mg = kv_t$ or choose the correct v–t graph shape.'],
      ja: ['$\\mu$ の斜面上の物体：静止するか。滑るなら加速度や停止距離。', '衝突後に粗い床を滑る距離の比 ∝ $v^2$（反発係数と組み合わせ）。', '終端速度：$mg = kv_t$ から $v_t$ を読む、または正しい v–t グラフの形を選ぶ。'],
    },
    traps: {
      en: ['Friction on a body that is **pushed but not moving** is not $\\mu N$ — it equals the push.', 'Friction can point **forward**: it is what accelerates a car\'s tyres or a box on an accelerating conveyor belt.', 'Terminal velocity is reached asymptotically; the body never "stops falling", it stops *accelerating*.'],
      ja: ['**押されても動かない**物体の摩擦力は $\\mu N$ ではなく、押す力に等しい。', '摩擦力が**進行方向**を向くこともある：車のタイヤや加速するベルトコンベア上の箱を加速させるのは摩擦力。', '終端速度には漸近的に近づく。「落ちるのをやめる」のではなく*加速を*やめる。'],
    },
    followups: {
      en: ['Why is kinetic friction usually smaller than maximum static friction?', 'Take me through the "does it slide?" procedure with numbers.', 'How does the v–t graph look for a falling body with air resistance, and why?', 'Explain the energy method for stopping distance on a rough floor.'],
      ja: ['なぜ動摩擦力はふつう最大静止摩擦力より小さいの？', '「滑るか？」の判定を数値でやって。', '空気抵抗のある落下の v–t グラフはどんな形で、なぜ？', '粗い床での停止距離をエネルギーで求める方法を説明して。'],
    },
  },
  {
    id: 'work-energy',
    core: {
      en: 'Work is force × distance in the direction of the force; the net work on a body equals its change in kinetic energy. This work–energy theorem turns "force over a distance" questions into simple algebra without time.',
      ja: '仕事 = 力 × 力の向きの移動距離。物体にされた仕事の合計 = 運動エネルギーの変化。この「仕事と運動エネルギーの関係」を使えば、時間を使わずに「力 × 距離」の問題が単純な計算になる。',
    },
    body: {
      en: r`## Work
$W = F d\cos\theta$ ($\theta$ = angle between force and displacement).
- Force along motion: positive work (speeds up).
- Force against motion (friction): negative work (slows down).
- Force **perpendicular** to motion: zero work — normal force on a slope, tension in circular motion, gravity on horizontal motion.
- Variable force: work = **area under the F–x graph** (spring: $\tfrac12 kx^2$).

## Work–energy theorem
$$W_{net} = \tfrac12 mv^2 - \tfrac12 mv_0^2$$
Whatever the path or the time, add up the work of every force and it equals the change in $K$. Example: a block pushed from rest by $F$ over $d$ on a floor with friction $f$: $\tfrac12 mv^2 = (F - f)d$.

## Power
$P = W/t$, and for a steady force $P = Fv$. A car at constant speed on a slope: engine power $= (mg\sin\theta + f)v$. Units: W = J/s; 1 kWh = $3.6\times10^6$ J.

## Principle of work
Machines (pulleys, levers, slopes) reduce the **force** but not the **work**: pulling with half the force means pulling twice the rope. Ideal efficiency 100%; real efficiency = useful work out / work in.`,
      ja: r`## 仕事
$W = F d\cos\theta$（$\theta$ = 力と変位のなす角）。
- 運動方向の力：正の仕事（速くなる）。
- 逆向きの力（摩擦）：負の仕事（遅くなる）。
- 運動に**垂直**な力：仕事0 — 斜面の垂直抗力、円運動の張力、水平運動での重力。
- 変化する力：仕事 = **F–x グラフの面積**（ばね：$\tfrac12 kx^2$）。

## 仕事と運動エネルギーの関係
$$W_{合計} = \tfrac12 mv^2 - \tfrac12 mv_0^2$$
経路や時間によらず、すべての力の仕事を足すと $K$ の変化に等しい。例：摩擦 $f$ のある床で静止した物体を $F$ で $d$ だけ押す：$\tfrac12 mv^2 = (F - f)d$。

## 仕事率
$P = W/t$、一定の力なら $P = Fv$。斜面を一定の速さで登る車：エンジンの仕事率 $= (mg\sin\theta + f)v$。単位 W = J/s、1 kWh = $3.6\times10^6$ J。

## 仕事の原理
道具（滑車・てこ・斜面）は**力**を減らすが**仕事**は減らさない：半分の力で引くなら2倍の長さを引く。理想は効率100%、実際の効率 = 有効な仕事 ÷ した仕事。`,
    },
    exam: {
      en: ['Work done by each force (gravity, normal, friction, applied) on a block dragged up a slope; which is zero.', 'Speed after a force acts over a distance, with friction present (work–energy).', 'Power of a motor lifting a load at constant speed: $P = mgv$.'],
      ja: ['斜面上を引き上げる物体に各力（重力・垂直抗力・摩擦・引く力）がする仕事、どれが0か。', '摩擦のある中で力がある距離はたらいた後の速さ（仕事と運動エネルギー）。', '一定の速さで荷物を持ち上げるモーターの仕事率 $P = mgv$。'],
    },
    traps: {
      en: ['Work by gravity is $-mgh$ when going up and $+mgh$ going down — sign depends on direction, not on the size of the force.', 'Kinetic energy uses $v^2$: doubling the speed quadruples $K$ and the stopping distance.', 'Holding a heavy box still does zero work in physics, however tired you get.'],
      ja: ['重力の仕事は上るとき $-mgh$、下るとき $+mgh$。符号は向きで決まり、力の大きさではない。', '運動エネルギーは $v^2$：速さ2倍で $K$ も停止距離も4倍。', '重い箱を持ったまま静止しても、物理では仕事は0。'],
    },
    followups: {
      en: ['Why is the work of the normal force on a slope zero?', 'Derive the work–energy theorem from v² − v₀² = 2ax.', 'Give me a power problem for a car climbing a hill.', 'Why does stopping distance scale with v² and not v?'],
      ja: ['なぜ斜面の垂直抗力の仕事は0なの？', 'v² − v₀² = 2ax から仕事と運動エネルギーの関係を導いて。', '坂を登る車の仕事率の問題を出して。', 'なぜ停止距離は v ではなく v² に比例するの？'],
    },
  },
  {
    id: 'potential-energy',
    core: {
      en: 'When only gravity and springs do work, mechanical energy K + U is the same at every point. Pick two points, write K + U at each, set them equal — no forces, no accelerations, no time. If friction or a push does work, add that work to one side.',
      ja: '重力とばねだけが仕事をするとき、力学的エネルギー K + U はどの点でも同じ。2つの点を選び、それぞれで K + U を書いて等しいとおく — 力も加速度も時間も不要。摩擦や押す力が仕事をするなら、その仕事を片側に足す。',
    },
    body: {
      en: r`## The two potential energies
- Gravity: $U = mgh$, measured from any reference height you choose (only differences matter).
- Spring: $U = \tfrac12 kx^2$, $x$ = stretch or compression from natural length.

## Conservation
$$\tfrac12 mv_1^2 + mgh_1 + \tfrac12 kx_1^2 = \tfrac12 mv_2^2 + mgh_2 + \tfrac12 kx_2^2$$
Holds when the only forces doing work are gravity and spring force (normal force and tension perpendicular to motion do no work, so they are fine).

## With friction or an external push
$$E_2 = E_1 + W_{other}$$
where $W_{other}$ is the work of friction (negative, $-\mu' N d$) or of an applied force.

## Where it shines
- **Pendulum / slide / loop**: speed at the bottom $v = \sqrt{2gh}$ regardless of path shape.
- **Loop-the-loop**: at the top you need $v^2 \ge gR$ (normal force ≥ 0), so release height $h \ge \tfrac52 R$.
- **Spring launcher**: $\tfrac12 kx^2 = \tfrac12 mv^2$ → $v = x\sqrt{k/m}$.
- **Block dropped onto a spring**: $mg(h + x) = \tfrac12 kx^2$ at maximum compression (velocity zero there). Note the extra $x$ in the height.

## Energy graphs
:::fig shm-energy

For a spring, $U(x)$ is a parabola and $K = E - U$ is an upside-down parabola. The EJU shows six sketches and asks which is $K(x)$: it must be zero at the turning points and maximal where $U$ is minimal.`,
      ja: r`## 2つの位置エネルギー
- 重力：$U = mgh$。基準の高さは自由（差だけが意味をもつ）。
- ばね：$U = \tfrac12 kx^2$。$x$ = 自然長からの伸びまたは縮み。

## 保存則
$$\tfrac12 mv_1^2 + mgh_1 + \tfrac12 kx_1^2 = \tfrac12 mv_2^2 + mgh_2 + \tfrac12 kx_2^2$$
仕事をする力が重力と弾性力だけのとき成立（運動に垂直な垂直抗力や張力は仕事をしないので問題なし）。

## 摩擦や外力があるとき
$$E_2 = E_1 + W_{その他}$$
$W_{その他}$ は摩擦の仕事（負、$-\mu' N d$）や加えた力の仕事。

## 得意な場面
- **振り子・滑り台・ループ**：最下点の速さ $v = \sqrt{2gh}$、経路の形によらない。
- **ループコースター**：最高点で $v^2 \ge gR$（垂直抗力 ≥ 0）が必要 → 放す高さ $h \ge \tfrac52 R$。
- **ばね発射**：$\tfrac12 kx^2 = \tfrac12 mv^2$ → $v = x\sqrt{k/m}$。
- **ばねの上に落とす**：最大圧縮（速度0）で $mg(h + x) = \tfrac12 kx^2$。高さに $x$ が足されることに注意。

## エネルギーのグラフ
:::fig shm-energy

ばねでは $U(x)$ が放物線、$K = E - U$ は上下逆の放物線。EJUは6つの図から $K(x)$ を選ばせる：折り返し点で0、$U$ が最小の点で最大でなければならない。`,
    },
    exam: {
      en: ['Choose the correct K–x graph for a block on a spring or sliding on a curved track (block I, nearly every year).', 'Speed at the bottom of a curved slide, then how far it slides on a rough floor.', 'Minimum height to complete a vertical loop; or maximum compression of a spring hit by a block.'],
      ja: ['ばねにつけた物体や曲面を滑る物体の正しい K–x グラフを選ぶ（大問 I、ほぼ毎年）。', '曲面の最下点での速さ、その後粗い床を滑る距離。', '鉛直ループを回りきる最小の高さ、または物体がぶつかったばねの最大圧縮。'],
    },
    traps: {
      en: ['Spring energy uses the **total** stretch $x$, so going from $x_1$ to $x_2$ releases $\\tfrac12 k(x_1^2 - x_2^2)$, **not** $\\tfrac12 k(x_1-x_2)^2$.', 'At maximum compression the velocity is zero but the acceleration is **not** zero (it is maximal).', 'A block hanging on a spring in equilibrium already stretches it by $mg/k$; oscillation questions measure $x$ from **that** point.'],
      ja: ['ばねのエネルギーは**全体の**伸び $x$ で決まる。$x_1$ から $x_2$ までに放出されるのは $\\tfrac12 k(x_1^2 - x_2^2)$ であって $\\tfrac12 k(x_1-x_2)^2$ **ではない**。', '最大圧縮点では速度0だが加速度は0**ではない**（最大）。', 'ばねにつるした物体はつり合いですでに $mg/k$ 伸びている。振動の問題では**そこ**から $x$ を測る。'],
    },
    followups: {
      en: ['Why does the speed at the bottom not depend on the shape of the slide?', 'Explain the loop-the-loop condition v² ≥ gR at the top.', 'Show me how to spot the correct K–x graph quickly.', 'Why is spring energy ½kx² and not kx²?'],
      ja: ['なぜ最下点の速さは滑り台の形によらないの？', 'ループ最高点の条件 v² ≥ gR を説明して。', '正しい K–x グラフを素早く見分けるコツは？', 'なぜばねのエネルギーは kx² ではなく ½kx² なの？'],
    },
  },
  {
    id: 'momentum-impulse',
    core: {
      en: 'Momentum p = mv changes only when a net external force acts, by exactly the impulse F·Δt. Two bodies that push on each other keep their total momentum. Combine "total momentum before = after" with the restitution ratio e to solve any 1-D collision.',
      ja: '運動量 p = mv は外力がはたらいたときだけ、力積 F·Δt の分だけ変わる。互いに押し合う2物体の運動量の和は変わらない。「衝突前後で運動量の和が等しい」と反発係数 e の式を組み合わせれば1次元の衝突はすべて解ける。',
    },
    body: {
      en: r`## Impulse–momentum
$$\vec F \Delta t = m\vec v' - m\vec v$$
Impulse = **area under the F–t graph** (the EJU draws a triangle or trapezoid and asks for the final speed). Momentum is a vector: a ball bouncing straight back at the same speed has $\Delta p = 2mv$, not zero.

## Conservation of momentum
If no external force along a direction (or the collision is so short that external forces are negligible):
$$m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'$$
Works for collisions, explosions (fission), a person jumping off a boat, a gun recoiling, and two bodies coalescing ($v' = \frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}$).

## Coefficient of restitution
:::fig collision

$$e = \frac{v_2' - v_1'}{v_1 - v_2} = \frac{\text{speed of separation}}{\text{speed of approach}}, \quad 0 \le e \le 1$$
Against a fixed wall/floor: $e = |v'|/|v|$. A ball dropped from $h$ bounces to $e^2 h$.

| $e$ | name | kinetic energy |
|---|---|---|
| 1 | elastic | conserved |
| $0<e<1$ | inelastic | some lost (heat, sound) |
| 0 | perfectly inelastic (stick together) | most lost |

## Solving a 1-D collision
Two equations (momentum, restitution), two unknowns ($v_1', v_2'$). Equal masses with $e=1$: they **swap** velocities. Moving ball hits a resting one of equal mass with $e$: $v_1' = \frac{1-e}{2}v$, $v_2' = \frac{1+e}{2}v$.

## 2-D collisions
Conserve momentum in $x$ and $y$ separately. Energy is only conserved if the question says elastic.`,
      ja: r`## 力積と運動量
$$\vec F \Delta t = m\vec v' - m\vec v$$
力積 = **F–t グラフの面積**（EJUは三角形や台形を描いて最終速度を問う）。運動量はベクトル：同じ速さで真っすぐはね返るボールの $\Delta p$ は $2mv$ であって0ではない。

## 運動量保存則
ある方向に外力がない（または衝突が短く外力が無視できる）とき：
$$m_1 v_1 + m_2 v_2 = m_1 v_1' + m_2 v_2'$$
衝突、分裂（爆発）、ボートから飛び降りる人、銃の反動、合体（$v' = \frac{m_1 v_1 + m_2 v_2}{m_1 + m_2}$）に使える。

## 反発係数
:::fig collision

$$e = \frac{v_2' - v_1'}{v_1 - v_2} = \frac{\text{離れる速さ}}{\text{近づく速さ}}, \quad 0 \le e \le 1$$
固定した壁・床に対しては $e = |v'|/|v|$。高さ $h$ から落としたボールは $e^2 h$ まで跳ね上がる。

| $e$ | 名前 | 運動エネルギー |
|---|---|---|
| 1 | 弾性衝突 | 保存 |
| $0<e<1$ | 非弾性衝突 | 一部失われる（熱・音） |
| 0 | 完全非弾性（合体） | 最も失われる |

## 1次元衝突の解き方
式2本（運動量、反発係数）、未知数2つ（$v_1', v_2'$）。等しい質量で $e=1$：速度が**入れかわる**。静止した同じ質量の球に $e$ でぶつかる：$v_1' = \frac{1-e}{2}v$、$v_2' = \frac{1+e}{2}v$。

## 2次元衝突
$x$、$y$ それぞれで運動量保存。エネルギー保存は「弾性衝突」と書かれたときだけ。`,
    },
    exam: {
      en: ['F–t graph → final speed via impulse (block I, frequent).', 'Collision with given $e$: post-collision speeds, or the range of a speed for $0 \\le e \\le 1$, or the ratio of sliding distances afterwards on a rough floor ($d \\propto v^2$).', 'Bodies on a cart / a person walking on a boat: use momentum conservation to find how far the cart moves.'],
      ja: ['F–t グラフ → 力積から最終速度（大問 I、頻出）。', '$e$ が与えられた衝突：衝突後の速度、$0 \\le e \\le 1$ での速度の範囲、その後粗い床を滑る距離の比（$d \\propto v^2$）。', '台車上の物体・ボート上を歩く人：運動量保存で台車の移動距離。'],
    },
    traps: {
      en: ['Kinetic energy is **not** conserved in a general collision; momentum **is** (even when $e<1$).', 'Gravity acts during a collision, but the collision is so brief that its impulse is negligible — vertical momentum is still not conserved over a long fall.', 'For a ball hitting a wall, use the sign: $v_{after} = -e\\,v_{before}$.'],
      ja: ['一般の衝突で運動エネルギーは保存**しない**。運動量は保存**する**（$e<1$ でも）。', '衝突中も重力ははたらくが、時間が短いので力積は無視できる。ただし長い落下では鉛直方向の運動量は保存しない。', '壁にぶつかるボールは符号に注意：$v_{後} = -e\\,v_{前}$。'],
    },
    followups: {
      en: ['Why is momentum conserved but kinetic energy not?', 'Derive the results v₁′ = (1−e)v/2 and v₂′ = (1+e)v/2.', 'How high does a ball bounce after n bounces?', 'Give me an F–t graph problem and check my impulse calculation.'],
      ja: ['なぜ運動量は保存されて運動エネルギーは保存されないの？', 'v₁′ = (1−e)v/2、v₂′ = (1+e)v/2 を導いて。', 'n 回はねた後のボールの高さは？', 'F–t グラフの問題を出して、力積の計算を確認して。'],
    },
  },
  {
    id: 'circular-motion',
    core: {
      en: 'Moving in a circle at constant speed still means accelerating, because the direction keeps changing. That acceleration points to the centre with size v²/r, so some real force (tension, gravity, friction, normal force) must supply mv²/r toward the centre.',
      ja: '一定の速さで円を回っていても向きが変わり続けるので加速している。その加速度は中心向きで大きさ v²/r。だから何か実在の力（張力・重力・摩擦・垂直抗力）が中心向きに mv²/r を供給しなければならない。',
    },
    body: {
      en: r`## Describing the motion
:::fig circular

- Angular velocity $\omega$ (rad/s): $v = r\omega$.
- Period $T = 2\pi/\omega = 2\pi r/v$; frequency $f = 1/T$; $\omega = 2\pi f$.
- Centripetal acceleration $a = \dfrac{v^2}{r} = r\omega^2 = v\omega$, always toward the centre.

## Equation of motion
Toward the centre: $\sum F_{\text{to centre}} = m\dfrac{v^2}{r}$. Perpendicular to the plane (if any): $\sum F = 0$.

**Centripetal force is not an extra force.** It is the name for the net inward force that the ordinary forces happen to provide. Never draw it as a separate arrow.

## Standard cases
| situation | inward force |
|---|---|
| ball on a string, horizontal circle on a smooth table | $T = mv^2/r$ |
| conical pendulum (string at angle $\theta$) | $T\sin\theta = mr\omega^2$, $T\cos\theta = mg$ → $\omega^2 = g/(l\cos\theta)$ |
| car on a flat curve | friction $\le \mu mg$ → $v_{max} = \sqrt{\mu g r}$ |
| banked curve, no friction | $N\sin\theta = mv^2/r$, $N\cos\theta = mg$ → $\tan\theta = v^2/gr$ |
| satellite | gravity $GMm/r^2 = mv^2/r$ |

## Vertical circle (non-uniform)
Speed changes, so use **energy** for the speed and the **radial equation** for the force. At the top of a string-circle: $T + mg = mv^2/r$; the string stays taut if $v_{top}^2 \ge gr$. At the bottom: $T - mg = mv^2/r$ — tension is largest there.`,
      ja: r`## 運動の表し方
:::fig circular

- 角速度 $\omega$（rad/s）：$v = r\omega$。
- 周期 $T = 2\pi/\omega = 2\pi r/v$、回転数 $f = 1/T$、$\omega = 2\pi f$。
- 向心加速度 $a = \dfrac{v^2}{r} = r\omega^2 = v\omega$、常に中心向き。

## 運動方程式
中心向き：$\sum F_{中心向き} = m\dfrac{v^2}{r}$。面に垂直な方向（あれば）：$\sum F = 0$。

**向心力は追加の力ではない。**ふつうの力が結果として供給している中心向きの合力の名前。別の矢印として描かない。

## 定番
| 状況 | 中心向きの力 |
|---|---|
| なめらかな机上で糸につけた球の水平円運動 | $T = mv^2/r$ |
| 円錐振り子（糸が角 $\theta$） | $T\sin\theta = mr\omega^2$、$T\cos\theta = mg$ → $\omega^2 = g/(l\cos\theta)$ |
| 平らなカーブを曲がる車 | 摩擦 $\le \mu mg$ → $v_{max} = \sqrt{\mu g r}$ |
| 傾いたカーブ、摩擦なし | $N\sin\theta = mv^2/r$、$N\cos\theta = mg$ → $\tan\theta = v^2/gr$ |
| 人工衛星 | 万有引力 $GMm/r^2 = mv^2/r$ |

## 鉛直面内の円運動（等速でない）
速さが変わるので、速さは**エネルギー**、力は**半径方向の式**。糸の円運動の最高点：$T + mg = mv^2/r$、糸がたるまない条件は $v_{頂}^2 \ge gr$。最下点：$T - mg = mv^2/r$、張力はここで最大。`,
    },
    exam: {
      en: ['Ball on a string of given geometry (conical pendulum or a string through a hole with a hanging mass): find $T$, $\\omega$ or the period.', 'Ratio of speeds/tensions at top and bottom of a vertical circle.', 'Minimum speed at the top so the string does not slack, or so a car stays on a hump ($v^2 \\le gr$ to stay on).'],
      ja: ['形状が与えられた糸につけた球（円錐振り子、穴を通した糸におもり）：$T$、$\\omega$、周期。', '鉛直円運動の最高点と最下点での速さ・張力の比。', '糸がたるまない最小の速さ、または車が丘の頂上で浮かない条件（$v^2 \\le gr$）。'],
    },
    traps: {
      en: ['$a = v^2/r$ is not zero even though the speed is constant.', 'In a conical pendulum the radius is $l\\sin\\theta$, not $l$.', 'At the top of a loop the normal force / tension can be **zero** but $mg$ still provides $mv^2/r$; the body does not fall off until $v^2 < gr$.'],
      ja: ['速さが一定でも $a = v^2/r$ は0ではない。', '円錐振り子の半径は $l$ ではなく $l\\sin\\theta$。', 'ループの最高点で垂直抗力・張力は**0**になりうるが、$mg$ が $mv^2/r$ を供給する。$v^2 < gr$ になるまで落ちない。'],
    },
    followups: {
      en: ['Why is there acceleration if the speed is constant?', 'Derive the conical pendulum period.', 'Why is tension largest at the bottom of a vertical circle?', 'Give me a banked-curve problem and check my equations.'],
      ja: ['速さが一定なのになぜ加速度があるの？', '円錐振り子の周期を導いて。', 'なぜ鉛直円運動では最下点で張力が最大なの？', '傾いたカーブの問題を出して、式を確認して。'],
    },
  },
  {
    id: 'inertial-force',
    core: {
      en: 'Inside an accelerating frame (lift, train, rotating platform) you may pretend to be at rest if you add a fictitious force −ma on every mass, pointing opposite to the frame\'s acceleration. In a rotating frame that fictitious force is the centrifugal force mrω², pointing outward.',
      ja: '加速する乗り物（エレベーター・電車・回転台）の中では、すべての質量に「乗り物の加速度と逆向きの見かけの力 −ma」を加えれば、静止しているとして扱ってよい。回転系ではその見かけの力が外向きの遠心力 mrω²。',
    },
    body: {
      en: r`## Two equally valid views
| view | what you write |
|---|---|
| from the ground (inertial) | real forces only: $\sum F = ma$ |
| from inside the accelerating frame | real forces **+ inertial force** $-m\vec a_{frame}$: $\sum F = 0$ (if the object is at rest in the frame) |

Pick one and stay in it. Mixing them double-counts.

## Lift (elevator)
Scale reading = normal force $N$. Lift accelerating **up** with $a$: $N = m(g + a)$ (heavier). Accelerating **down**: $N = m(g - a)$ (lighter). Free fall: $N = 0$ ("weightless"). A pendulum inside a lift with acceleration $a$ upward swings with effective gravity $g' = g + a$: $T = 2\pi\sqrt{l/(g+a)}$.

## Accelerating train
A hanging ball tilts backward by $\tan\theta = a/g$. From inside: tension, gravity and inertial force $ma$ (backward) balance. From outside: the horizontal tension component supplies $ma$.

## Centrifugal force
In the rotating frame, add $mr\omega^2$ **outward**. A bead at rest on a rotating rough disc: friction (inward) balances $mr\omega^2$ → slips when $mr\omega^2 > \mu mg$. Water in a rotating bucket forms a parabola; a conical pendulum "balances" $T$, $mg$ and $mr\omega^2$.

> Centrifugal force is real to the person in the frame and does not exist for the ground observer. Neither is "wrong" — they are two descriptions of the same motion.`,
      ja: r`## どちらも正しい2つの見方
| 見方 | 書く式 |
|---|---|
| 地上から（慣性系） | 実在の力だけ：$\sum F = ma$ |
| 加速する乗り物の中から | 実在の力 **＋慣性力** $-m\vec a_{乗り物}$：$\sum F = 0$（物体が乗り物内で静止していれば） |

どちらかを選んで最後までそれで通す。混ぜると二重に数える。

## エレベーター
はかりの目盛り = 垂直抗力 $N$。**上向き**に加速度 $a$：$N = m(g + a)$（重くなる）。**下向き**に加速：$N = m(g - a)$（軽くなる）。自由落下：$N = 0$（無重量）。上向き加速度 $a$ のエレベーター内の振り子は見かけの重力 $g' = g + a$ で振れる：$T = 2\pi\sqrt{l/(g+a)}$。

## 加速する電車
つるした球は後ろへ $\tan\theta = a/g$ だけ傾く。車内から：張力・重力・慣性力 $ma$（後ろ向き）がつり合う。車外から：張力の水平成分が $ma$ を供給。

## 遠心力
回転系では $mr\omega^2$ を**外向き**に加える。回転する粗い円板上で静止するビーズ：摩擦（内向き）が $mr\omega^2$ とつり合う → $mr\omega^2 > \mu mg$ で滑る。回転するバケツの水面は放物面。円錐振り子は $T$、$mg$、$mr\omega^2$ が「つり合う」。

> 遠心力は乗っている人には実在し、地上の観測者には存在しない。どちらも「間違い」ではなく、同じ運動の2通りの記述。`,
    },
    exam: {
      en: ['Scale reading in a lift accelerating up/down, or a pendulum period in a lift.', 'Tilt angle of a hanging mass in an accelerating car; or the water surface in an accelerating tank.', 'Object on a rotating turntable: maximum $\\omega$ before it slips.'],
      ja: ['上下に加速するエレベーター内のはかりの読み、または振り子の周期。', '加速する車内でつるしたおもりの傾き、加速する水槽の水面。', '回転台上の物体：滑り出す直前の最大 $\\omega$。'],
    },
    traps: {
      en: ['The inertial force points **opposite** to the frame\'s acceleration, not opposite to its velocity (a decelerating train throws you forward).', 'Do not add centrifugal force **and** write $mv^2/r$ on the other side — that is the same thing twice.', 'In free fall the scale reads zero, but gravity still acts.'],
      ja: ['慣性力は乗り物の**加速度**と逆向き。速度と逆向きではない（減速する電車では前に押される）。', '遠心力を加えたうえで右辺に $mv^2/r$ も書かない。同じものを2回数えている。', '自由落下でははかりは0だが、重力ははたらいている。'],
    },
    followups: {
      en: ['Why does a decelerating train push me forward?', 'Solve the lift-scale problem from both viewpoints.', 'When should I use centrifugal force and when mv²/r?', 'Explain why astronauts float although gravity is still strong in orbit.'],
      ja: ['減速する電車でなぜ前に押されるの？', 'エレベーターのはかりの問題を2つの見方で解いて。', '遠心力を使うときと mv²/r を使うときの使い分けは？', '軌道上では重力が強いのに宇宙飛行士が浮くのはなぜ？'],
    },
  },
  {
    id: 'shm',
    core: {
      en: 'Whenever the restoring force is proportional to displacement (F = −Kx), the motion is simple harmonic with ω = √(K/m) — the period does not depend on the amplitude. Springs give K = k; a pendulum gives K = mg/l. Everything else (v, a, energy) follows from x = A sin ωt.',
      ja: '復元力が変位に比例する（F = −Kx）なら運動は単振動で ω = √(K/m)。周期は振幅によらない。ばねなら K = k、振り子なら K = mg/l。速度・加速度・エネルギーはすべて x = A sin ωt から出る。',
    },
    body: {
      en: r`## Recognising SHM
Write the equation of motion; if it has the form $ma = -Kx$, then $\omega = \sqrt{K/m}$, $T = 2\pi\sqrt{m/K}$. That is the whole method — find $K$.

| system | $K$ | period |
|---|---|---|
| horizontal spring | $k$ | $2\pi\sqrt{m/k}$ |
| vertical spring (measure $x$ from equilibrium) | $k$ | $2\pi\sqrt{m/k}$ (gravity only shifts the centre) |
| simple pendulum, small angle | $mg/l$ | $2\pi\sqrt{l/g}$ (independent of mass!) |
| springs in parallel | $k_1 + k_2$ | shorter |
| springs in series | $k_1k_2/(k_1+k_2)$ | longer |

## Motion equations
$x = A\sin(\omega t + \phi)$, $v = A\omega\cos(\omega t + \phi)$, $a = -A\omega^2\sin(\omega t+\phi) = -\omega^2 x$.
- Max speed $A\omega$ at the centre; max acceleration $A\omega^2$ at the ends.
- $v = \pm\omega\sqrt{A^2 - x^2}$ — speed at any position without time.
- SHM is the shadow (projection) of uniform circular motion of radius $A$ and angular velocity $\omega$ — use the circle to read phases quickly.

## Energy
:::fig shm-energy

$E = \tfrac12 K A^2 = \tfrac12 mv^2 + \tfrac12 K x^2$ — constant. Doubling $A$ quadruples $E$ but leaves $T$ unchanged.

## Timing tricks
From centre to end: $T/4$. From $x=0$ to $x=A/2$: $T/12$ (since $\sin\omega t = 1/2$ → $\omega t = \pi/6$). From $A/2$ to $A$: $T/6$. Learn these — they come up in "how long until…" questions.`,
      ja: r`## 単振動の見分け方
運動方程式を書いて $ma = -Kx$ の形なら $\omega = \sqrt{K/m}$、$T = 2\pi\sqrt{m/K}$。方法はこれだけ — $K$ を見つける。

| 系 | $K$ | 周期 |
|---|---|---|
| 水平ばね | $k$ | $2\pi\sqrt{m/k}$ |
| 鉛直ばね（つり合い位置から $x$） | $k$ | $2\pi\sqrt{m/k}$（重力は中心をずらすだけ） |
| 単振り子、小さい振れ | $mg/l$ | $2\pi\sqrt{l/g}$（質量によらない！） |
| ばね並列 | $k_1 + k_2$ | 短くなる |
| ばね直列 | $k_1k_2/(k_1+k_2)$ | 長くなる |

## 運動の式
$x = A\sin(\omega t + \phi)$、$v = A\omega\cos(\omega t + \phi)$、$a = -A\omega^2\sin(\omega t+\phi) = -\omega^2 x$。
- 最大の速さ $A\omega$ は中心、最大の加速度 $A\omega^2$ は端。
- $v = \pm\omega\sqrt{A^2 - x^2}$ — 時間を使わずに位置から速さ。
- 単振動は半径 $A$、角速度 $\omega$ の等速円運動の影（正射影）。円で位相を読むと速い。

## エネルギー
:::fig shm-energy

$E = \tfrac12 K A^2 = \tfrac12 mv^2 + \tfrac12 K x^2$ で一定。$A$ を2倍にすると $E$ は4倍だが $T$ は変わらない。

## 時間のコツ
中心から端まで：$T/4$。$x=0$ から $x=A/2$ まで：$T/12$（$\sin\omega t = 1/2$ → $\omega t = \pi/6$）。$A/2$ から $A$ まで：$T/6$。「〜までの時間」問題で出るので覚える。`,
    },
    exam: {
      en: ['Spring–mass pulled and released: period, max speed, speed at a given $x$, or the K(x) / U(x) graph.', 'Period of a pendulum when $l$ or $g$ changes (lift, other planet): ratio of periods.', 'Time for the mass to travel from $A$ to $A/2$ (fractions of $T$).'],
      ja: ['引いて放したばね振り子：周期、最大の速さ、ある $x$ での速さ、K(x)・U(x) のグラフ。', '$l$ や $g$ が変わった（エレベーター、他の惑星）ときの振り子の周期の比。', '$A$ から $A/2$ まで動く時間（$T$ の分数）。'],
    },
    traps: {
      en: ['The period of a pendulum does not depend on mass or (small) amplitude; the period of a spring does not depend on $g$.', 'For a vertical spring, measure $x$ from the **equilibrium** point; $mg$ then disappears from the equation.', 'At the end points velocity is zero but acceleration is maximal — the opposite of the centre.'],
      ja: ['振り子の周期は質量や（小さい）振幅によらない。ばね振り子の周期は $g$ によらない。', '鉛直ばねでは**つり合い点**から $x$ を測る。すると式から $mg$ が消える。', '端では速度0だが加速度は最大 — 中心と逆。'],
    },
    followups: {
      en: ['Show me why a vertical spring has the same period as a horizontal one.', 'Derive the pendulum period from F = −(mg/l)x.', 'Why is the time from 0 to A/2 exactly T/12?', 'Use the circular-motion picture to explain phase.'],
      ja: ['鉛直ばねの周期が水平ばねと同じ理由を見せて。', 'F = −(mg/l)x から振り子の周期を導いて。', '0 から A/2 までの時間がちょうど T/12 になるのはなぜ？', '等速円運動の絵で位相を説明して。'],
    },
  },
  {
    id: 'gravitation',
    core: {
      en: 'Every mass pulls every other mass with F = GMm/r². For orbits, that pull is the centripetal force, which gives v, T and the famous T² ∝ r³. Because gravity weakens with distance, potential energy is U = −GMm/r (zero at infinity); energy conservation with this U handles escape speed and elliptical orbits.',
      ja: 'すべての質量は F = GMm/r² で引き合う。軌道ではこの力が向心力になり、v、T、そして T² ∝ r³ が出る。距離で弱まる力なので位置エネルギーは U = −GMm/r（無限遠で0）。この U でエネルギー保存を書けば脱出速度も楕円軌道も扱える。',
    },
    body: {
      en: r`## Kepler's three laws
1. Orbits are ellipses with the Sun at one focus.
2. The line to the planet sweeps equal areas in equal times → **faster when closer** ($r_1 v_1 = r_2 v_2$ at perihelion/aphelion).
3. $T^2/a^3$ is the same for every planet ($a$ = semi-major axis).

## Universal gravitation
$F = G\dfrac{Mm}{r^2}$, $G = 6.67\times10^{-11}$ N·m²/kg². At the surface $g = GM/R^2$; so $GM = gR^2$ — a very useful substitution when $G$ and $M$ are not given. At height $h$: $g' = g\left(\frac{R}{R+h}\right)^2$.

## Circular orbit
$G\dfrac{Mm}{r^2} = m\dfrac{v^2}{r}$ → $v = \sqrt{GM/r}$, $T = 2\pi\sqrt{r^3/GM}$ (this **is** Kepler's third law).
- First cosmic speed (orbit hugging the surface): $v_1 = \sqrt{gR} \approx 7.9$ km/s.
- Geostationary satellite: $T = 24$ h fixes $r \approx 6.6R$.

## Energy
$U = -\dfrac{GMm}{r}$ (negative; zero at infinity). Circular orbit: $K = \tfrac12\dfrac{GMm}{r}$, $E = K + U = -\dfrac{GMm}{2r}$ — a bound orbit has negative total energy.
- Escape speed: $\tfrac12 mv^2 - \dfrac{GMm}{R} = 0$ → $v_2 = \sqrt{2GM/R} = \sqrt2\, v_1 \approx 11.2$ km/s.
- Elliptical orbit: combine $r_1 v_1 = r_2 v_2$ (area law) with energy conservation to get the speeds at the two ends.

## Why $-GMm/r$ and not $mgh$
$mgh$ assumes constant $g$ — fine for a few km. For satellites $g$ changes, so integrate the real force. Both give the same **difference** near the surface: $\Delta U \approx mgh$.`,
      ja: r`## ケプラーの3法則
1. 軌道は太陽を1つの焦点とする楕円。
2. 惑星と太陽を結ぶ線は等しい時間に等しい面積を掃く → **近いほど速い**（近日点・遠日点で $r_1 v_1 = r_2 v_2$）。
3. $T^2/a^3$ はすべての惑星で同じ（$a$ = 長半径）。

## 万有引力
$F = G\dfrac{Mm}{r^2}$、$G = 6.67\times10^{-11}$ N·m²/kg²。地表で $g = GM/R^2$、つまり $GM = gR^2$ — $G$ や $M$ が与えられないときに便利な置きかえ。高さ $h$ で $g' = g\left(\frac{R}{R+h}\right)^2$。

## 円軌道
$G\dfrac{Mm}{r^2} = m\dfrac{v^2}{r}$ → $v = \sqrt{GM/r}$、$T = 2\pi\sqrt{r^3/GM}$（これが**そのまま**ケプラーの第3法則）。
- 第一宇宙速度（地表すれすれの軌道）：$v_1 = \sqrt{gR} \approx 7.9$ km/s。
- 静止衛星：$T = 24$ h から $r \approx 6.6R$。

## エネルギー
$U = -\dfrac{GMm}{r}$（負、無限遠で0）。円軌道では $K = \tfrac12\dfrac{GMm}{r}$、$E = K + U = -\dfrac{GMm}{2r}$ — 束縛された軌道は全エネルギーが負。
- 脱出速度（第二宇宙速度）：$\tfrac12 mv^2 - \dfrac{GMm}{R} = 0$ → $v_2 = \sqrt{2GM/R} = \sqrt2\, v_1 \approx 11.2$ km/s。
- 楕円軌道：$r_1 v_1 = r_2 v_2$（面積速度一定）とエネルギー保存を連立して両端の速さを求める。

## なぜ $mgh$ でなく $-GMm/r$ か
$mgh$ は $g$ 一定を仮定している — 数 km なら OK。人工衛星では $g$ が変わるので本当の力で積分する。地表付近では両者の**差**は一致：$\Delta U \approx mgh$。`,
    },
    exam: {
      en: ['Satellite in circular orbit at radius $r$ vs $2r$: ratio of speeds, periods, or energies.', 'Elliptical orbit: speed at the far point given the speed at the near point (area law), or which quantity is conserved.', 'Escape speed from a planet with different $M$ and $R$ (expressed via $g$ and $R$).'],
      ja: ['半径 $r$ と $2r$ の円軌道の衛星：速さ・周期・エネルギーの比。', '楕円軌道：近点の速さから遠点の速さ（面積速度一定）、保存する量はどれか。', '$M$ と $R$ の異なる惑星からの脱出速度（$g$ と $R$ で表す）。'],
    },
    traps: {
      en: ['$r$ in $GMm/r^2$ is the distance from the **centre**, so an orbit at height $h$ has $r = R + h$.', 'Gravitational PE is **negative**; "increasing" $U$ means getting closer to zero (further away).', 'Kepler\'s third law uses the semi-major axis, and it compares orbits around the **same** central body.'],
      ja: ['$GMm/r^2$ の $r$ は**中心**からの距離。高さ $h$ の軌道は $r = R + h$。', '万有引力の位置エネルギーは**負**。$U$ が「増える」= 0 に近づく（遠ざかる）。', 'ケプラーの第3法則は長半径を使い、**同じ**中心天体のまわりの軌道どうしを比べる。'],
    },
    followups: {
      en: ['Why is the total energy of an orbit negative?', 'Derive T² ∝ r³ from the equation of motion.', 'Why does a satellite speed up when it moves to a lower orbit if it loses energy?', 'Show the elliptical-orbit speed calculation with the area law.'],
      ja: ['なぜ軌道の全エネルギーは負なの？', '運動方程式から T² ∝ r³ を導いて。', '衛星はエネルギーを失うのに低い軌道に移ると速くなるのはなぜ？', '面積速度一定を使った楕円軌道の速さの計算を見せて。'],
    },
  },
  // ───────────────────────────── THERMODYNAMICS ─────────────────────────────
  {
    id: 'heat-temperature',
    core: {
      en: 'Temperature measures how vigorously molecules jiggle; heat is energy flowing from hot to cold. The heat needed to change temperature is Q = mcΔT, and when things are mixed, heat lost by the hot one = heat gained by the cold one.',
      ja: '温度は分子の熱運動の激しさ、熱は高温から低温へ流れるエネルギー。温度を変えるのに必要な熱量は Q = mcΔT。混ぜたときは「高温側が失った熱 = 低温側が得た熱」。',
    },
    body: {
      en: r`## Temperature
- Absolute temperature $T\,[\mathrm{K}] = t\,[^\circ\mathrm{C}] + 273$. A **difference** of 1 K = 1 °C, so $\Delta T$ is the same in both.
- 0 K: molecular motion is minimal — there is no lower temperature.
- Thermal equilibrium: two bodies in contact end up at the same temperature (heat flows until then).

## Heat capacity and specific heat
| quantity | symbol | meaning | unit |
|---|---|---|---|
| heat capacity | $C$ | heat to raise the **whole object** by 1 K | J/K |
| specific heat | $c$ | heat to raise **1 g (or 1 kg)** by 1 K | J/(g·K) |

$Q = C\Delta T = mc\Delta T$, and $C = mc$. Water: $c = 4.2$ J/(g·K) — large, which is why water heats and cools slowly.

## Conservation of heat (calorimetry)
Mix hot and cold in an insulated container; the final temperature $t$ satisfies
$$m_1 c_1 (t_1 - t) = m_2 c_2 (t - t_2)\ (+\ C_{container}(t - t_2))$$
Left: heat given up by the hot body. Right: heat absorbed by the cold body and the container. Solve for $t$. Write the hot side as (hot − final) and the cold side as (final − cold) so both are positive.

## Heat, work and energy
Heat is energy: 1 cal = 4.2 J. Joule's experiment: mechanical work (falling weight) raises water temperature. Friction work, electric energy $IVt$, and kinetic energy lost in a collision can all appear as $Q = mc\Delta T$.`,
      ja: r`## 温度
- 絶対温度 $T\,[\mathrm{K}] = t\,[^\circ\mathrm{C}] + 273$。1 K の**差**は 1 °C の差と同じなので、$\Delta T$ はどちらでも同じ。
- 0 K：分子の運動が最小。これより低い温度はない。
- 熱平衡：接触した2物体は最終的に同じ温度になる（それまで熱が流れる）。

## 熱容量と比熱
| 量 | 記号 | 意味 | 単位 |
|---|---|---|---|
| 熱容量 | $C$ | **物体全体**を 1 K 上げる熱量 | J/K |
| 比熱 | $c$ | **1 g（または 1 kg）**を 1 K 上げる熱量 | J/(g·K) |

$Q = C\Delta T = mc\Delta T$、$C = mc$。水：$c = 4.2$ J/(g·K) と大きいので、水は温まりにくく冷めにくい。

## 熱量の保存（熱量計）
断熱容器で高温と低温を混ぜると、最終温度 $t$ は
$$m_1 c_1 (t_1 - t) = m_2 c_2 (t - t_2)\ (+\ C_{容器}(t - t_2))$$
左辺：高温側が放出した熱。右辺：低温側と容器が吸収した熱。$t$ について解く。高温側は（高温 − 最終）、低温側は（最終 − 低温）と書けば両方正になる。

## 熱と仕事とエネルギー
熱はエネルギー：1 cal = 4.2 J。ジュールの実験：力学的仕事（落下するおもり）で水温が上がる。摩擦の仕事、電気エネルギー $IVt$、衝突で失われた運動エネルギーはすべて $Q = mc\Delta T$ として現れる。`,
    },
    exam: {
      en: ['Mix water at two temperatures (or water + a metal block + calorimeter of given heat capacity): final temperature, or the specific heat of the metal.', 'Heater of power $P$ warms $m$ grams of water for $t$ seconds: temperature rise, or efficiency if some heat is lost.', 'A falling body or a bullet stopping: fraction of kinetic energy that becomes heat and the resulting $\\Delta T$.'],
      ja: ['温度の違う水（または水＋金属＋熱容量の与えられた容器）を混ぜる：最終温度、金属の比熱。', '仕事率 $P$ のヒーターで $m$ g の水を $t$ 秒温める：温度上昇、熱が逃げる場合の効率。', '落下する物体や止まる弾丸：運動エネルギーのうち熱になる割合と $\\Delta T$。'],
    },
    traps: {
      en: ['Do not add 273 to a temperature **difference**.', 'Heat capacity $C$ is for the whole object; specific heat $c$ is per unit mass — check the units given.', 'If ice or steam is involved you need latent heat too (see the next topic) — $mc\\Delta T$ alone is wrong across a phase change.'],
      ja: ['温度**差**に 273 を足さない。', '熱容量 $C$ は物体全体、比熱 $c$ は単位質量あたり。与えられた単位を確認。', '氷や水蒸気が関わるなら潜熱も必要（次のトピック）。状態変化をまたぐとき $mc\\Delta T$ だけでは誤り。'],
    },
    followups: {
      en: ['Why does water have such a large specific heat, and what does that change in problems?', 'Walk through a three-body calorimetry problem with numbers.', 'What exactly is the difference between heat and temperature?', 'How do I set up a problem where a heater warms water but 20% of heat escapes?'],
      ja: ['水の比熱が大きいのはなぜで、問題では何が変わる？', '3つの物体を混ぜる熱量の問題を数値で解いて。', '熱と温度の違いは正確には何？', 'ヒーターで水を温めるが熱の20%が逃げる問題はどう立てる？'],
    },
  },
  {
    id: 'states-latent-heat',
    core: {
      en: 'While a substance melts or boils, the heat you add goes into breaking molecular bonds, not into raising the temperature — so the temperature stays flat. Latent heat L is the energy per gram for that change: Q = mL, with no ΔT.',
      ja: '融解や沸騰の最中は、加えた熱が分子どうしの結びつきをほどくのに使われ、温度は上がらない — だから温度は一定のまま。潜熱 L はその変化に必要な 1 g あたりのエネルギー：Q = mL、ΔT はなし。',
    },
    body: {
      en: r`## Heating curve of water (memorise the shape)
Ice warms ($mc_{ice}\Delta T$) → **flat at 0 °C while melting** ($mL_f$) → water warms ($mc_w\Delta T$) → **flat at 100 °C while boiling** ($mL_v$) → steam warms. On a temperature–time graph with constant heating power, the flat parts are the phase changes; the slope of each rising part is $\propto 1/(mc)$, so a steeper line means a smaller specific heat.

| for water | value |
|---|---|
| heat of fusion $L_f$ | 334 J/g (≈ 80 cal/g) |
| heat of vaporisation $L_v$ | 2260 J/g (≈ 540 cal/g) |
| $c$ of ice | 2.1 J/(g·K) |
| $c$ of water | 4.2 J/(g·K) |

$L_v \gg L_f$: separating molecules completely (gas) takes far more energy than loosening them (liquid).

## Ice-and-water mixing (the EJU favourite)
Ice at 0 °C, mass $m_i$, into water at $t$ °C, mass $m_w$:
- Heat available from water cooling to 0 °C: $m_w c\, t$.
- Heat needed to melt all ice: $m_i L_f$.
- If $m_w c\, t < m_i L_f$: not all ice melts, final temperature 0 °C, remaining ice $= m_i - m_w c\, t / L_f$.
- If larger: all melts, then set (water cooling) = (melting) + (melt water warming from 0 to $t_f$).

Always **check which case** before writing the balance.

## Thermal expansion
Length: $L = L_0(1 + \alpha\Delta T)$; volume: $V = V_0(1 + \beta\Delta T)$ with $\beta \approx 3\alpha$. Water is the exception: densest at 4 °C, so ice floats and lakes freeze from the top.

## Three states
Solid: fixed positions, vibrate. Liquid: touching but mobile. Gas: far apart, free flight, pressure from wall collisions. Melting/boiling points depend on pressure (water boils below 100 °C on a mountain).`,
      ja: r`## 水の加熱曲線（形を覚える）
氷が温まる（$mc_{氷}\Delta T$）→ **0 °C で一定のまま融解**（$mL_f$）→ 水が温まる（$mc_w\Delta T$）→ **100 °C で一定のまま沸騰**（$mL_v$）→ 水蒸気が温まる。一定の仕事率で加熱した温度–時間グラフでは、平らな部分が状態変化。上昇部分の傾きは $\propto 1/(mc)$ なので、急なほど比熱が小さい。

| 水の値 | |
|---|---|
| 融解熱 $L_f$ | 334 J/g（≈ 80 cal/g） |
| 蒸発熱 $L_v$ | 2260 J/g（≈ 540 cal/g） |
| 氷の比熱 | 2.1 J/(g·K) |
| 水の比熱 | 4.2 J/(g·K) |

$L_v \gg L_f$：分子を完全に引き離す（気体）方が、ゆるめる（液体）よりはるかにエネルギーがいる。

## 氷と水を混ぜる（EJUの定番）
0 °C の氷 $m_i$ を $t$ °C の水 $m_w$ に入れる：
- 水が 0 °C まで冷えて出せる熱：$m_w c\, t$。
- 氷を全部とかすのに必要な熱：$m_i L_f$。
- $m_w c\, t < m_i L_f$ なら氷は全部はとけず、最終温度 0 °C、残る氷 $= m_i - m_w c\, t / L_f$。
- 大きければ全部とけ、（水の冷却）=（融解）+（とけた水が 0 から $t_f$ まで温まる）とおく。

式を書く前に必ず**どちらの場合か確認**する。

## 熱膨張
長さ：$L = L_0(1 + \alpha\Delta T)$、体積：$V = V_0(1 + \beta\Delta T)$、$\beta \approx 3\alpha$。水は例外：4 °C で最も密度が大きいので氷は浮き、湖は上から凍る。

## 三態
固体：位置が固定され振動。液体：接しているが動ける。気体：離れて自由に飛び、壁との衝突で圧力。融点・沸点は圧力で変わる（山の上では水は 100 °C 以下で沸騰）。`,
    },
    exam: {
      en: ['Ice + warm water: mass of ice left, or final temperature (block II, most years).', 'Temperature–time graph of a heated substance: identify melting/boiling points, compare specific heats from slopes, find $L$ from the length of a flat part.', 'Heater power needed to boil away a given mass of water in a given time.'],
      ja: ['氷＋温かい水：残る氷の質量、または最終温度（大問 II、ほぼ毎年）。', '加熱した物質の温度–時間グラフ：融点・沸点を読む、傾きから比熱を比べる、平らな部分の長さから $L$。', '与えられた質量の水を一定時間で蒸発させるのに必要なヒーターの仕事率。'],
    },
    traps: {
      en: ['Ice below 0 °C must first be warmed **to** 0 °C (with $c_{ice}$) before any melting.', 'Melting does not change the temperature; students often write $m_i c\\, \\Delta T$ for the ice — the melt water warms **after** melting.', 'Evaporation happens below the boiling point too (puddles dry); boiling is evaporation throughout the liquid at the boiling point.'],
      ja: ['0 °C 以下の氷はまず $c_{氷}$ で 0 °C **まで**温めてから融解。', '融解中は温度が変わらない。氷について $m_i c\\, \\Delta T$ と書いてしまう誤りが多い — とけた水が温まるのは融解の**後**。', '蒸発は沸点以下でも起こる（水たまりが乾く）。沸騰は沸点で液体内部からも蒸発すること。'],
    },
    followups: {
      en: ['Why does temperature stay constant during melting even though I keep heating?', 'Do the ice-and-water problem with 50 g of ice and 200 g of water at 30 °C.', 'Why is the heat of vaporisation so much bigger than the heat of fusion?', 'How do I read specific heats from a temperature–time graph?'],
      ja: ['加熱し続けているのに融解中は温度が一定なのはなぜ？', '0 °C の氷 50 g と 30 °C の水 200 g の問題を解いて。', '蒸発熱が融解熱よりずっと大きいのはなぜ？', '温度–時間グラフから比熱をどう読む？'],
    },
  },
  {
    id: 'heat-work-laws',
    core: {
      en: 'A gas stores energy as molecular motion (internal energy U). Heat added to it either raises U or is spent as work pushing the piston out: Q = ΔU + W. That single bookkeeping line, plus "W = area under the p–V curve", solves every gas-process question.',
      ja: '気体はエネルギーを分子の運動（内部エネルギー U）として蓄える。加えた熱は U を増やすか、ピストンを押し出す仕事に使われる：Q = ΔU + W。この1行の収支と「W = p–V 曲線の下の面積」で気体の変化の問題はすべて解ける。',
    },
    body: {
      en: r`## First law of thermodynamics
$$Q = \Delta U + W$$
- $Q$: heat **absorbed** by the gas (negative if released).
- $\Delta U$: change of internal energy. For an ideal gas $U$ depends only on $T$: monatomic $U = \tfrac32 nRT$, so $\Delta U = \tfrac32 nR\Delta T$.
- $W$: work done **by** the gas $= p\Delta V$ at constant pressure; in general the area under the $p$–$V$ curve. Expansion → $W > 0$; compression → $W < 0$.

(Some books write $Q = \Delta U + W_{by}$, others $\Delta U = Q + W_{on}$. Same physics; fix your convention and stick to it.)

## Which quantity is zero?
| process | zero | consequence |
|---|---|---|
| isochoric (constant $V$) | $W = 0$ | $Q = \Delta U$ |
| isothermal (constant $T$) | $\Delta U = 0$ | $Q = W$ (all heat becomes work) |
| adiabatic (no heat) | $Q = 0$ | $\Delta U = -W$: expanding gas **cools**, compressed gas heats |
| isobaric (constant $p$) | — | $W = p\Delta V = nR\Delta T$ |

## Heat engines
Engine takes $Q_1$ from a hot source, does work $W$, dumps $Q_2$ to a cold sink: $W = Q_1 - Q_2$. Efficiency $e = \dfrac{W}{Q_1} = 1 - \dfrac{Q_2}{Q_1} < 1$ always. In a **cycle** $\Delta U = 0$ over the loop, so net work = net heat = **area enclosed** on the $p$–$V$ diagram (clockwise → positive work).

## Second law (irreversibility)
Heat flows spontaneously from hot to cold, never the reverse; no engine can turn heat into work with 100% efficiency; friction turns work into heat but heat does not turn back into ordered work by itself. Real processes are one-way.`,
      ja: r`## 熱力学第一法則
$$Q = \Delta U + W$$
- $Q$：気体が**吸収**した熱（放出なら負）。
- $\Delta U$：内部エネルギーの変化。理想気体の $U$ は $T$ だけで決まる：単原子分子 $U = \tfrac32 nRT$、よって $\Delta U = \tfrac32 nR\Delta T$。
- $W$：気体**が**した仕事。定圧なら $p\Delta V$、一般には $p$–$V$ 曲線の下の面積。膨張 → $W > 0$、圧縮 → $W < 0$。

（$Q = \Delta U + W_{した}$ と書く本と $\Delta U = Q + W_{された}$ と書く本がある。物理は同じ。自分の流儀を決めて統一する。）

## どの量が0か
| 変化 | 0になる量 | 結果 |
|---|---|---|
| 定積（$V$ 一定） | $W = 0$ | $Q = \Delta U$ |
| 等温（$T$ 一定） | $\Delta U = 0$ | $Q = W$（熱がすべて仕事になる） |
| 断熱（熱の出入りなし） | $Q = 0$ | $\Delta U = -W$：膨張すると**冷え**、圧縮すると熱くなる |
| 定圧（$p$ 一定） | — | $W = p\Delta V = nR\Delta T$ |

## 熱機関
高温熱源から $Q_1$ を受け取り、仕事 $W$ をして、低温熱源に $Q_2$ を捨てる：$W = Q_1 - Q_2$。熱効率 $e = \dfrac{W}{Q_1} = 1 - \dfrac{Q_2}{Q_1} < 1$、必ず1未満。**サイクル**では1周で $\Delta U = 0$ なので、正味の仕事 = 正味の熱 = $p$–$V$ 図で**囲まれた面積**（時計回り → 正の仕事）。

## 第二法則（不可逆性）
熱は高温から低温へ自然に流れ、逆は起こらない。熱を100%仕事に変える機関はない。摩擦で仕事は熱になるが、熱がひとりでに秩序ある仕事に戻ることはない。現実の変化は一方通行。`,
    },
    exam: {
      en: ['Gas taken from A to B by two paths (isobaric then isochoric vs isothermal): rank the heat absorbed, or find which process decreases $U$ (block II, nearly every year).', 'Cycle on a $p$–$V$ diagram: net work from the enclosed area; heat absorbed on each leg; efficiency $W/Q_{in}$.', 'Adiabatic compression: does the temperature rise or fall, and why.'],
      ja: ['A から B へ2つの経路（定圧→定積 と 等温）で変化させる：吸収した熱の大小、$U$ が減る過程はどれか（大問 II、ほぼ毎年）。', '$p$–$V$ 図上のサイクル：囲まれた面積から正味の仕事、各過程の吸熱、熱効率 $W/Q_{吸}$。', '断熱圧縮：温度は上がるか下がるか、その理由。'],
    },
    traps: {
      en: ['$W$ in $Q = \\Delta U + W$ is work **by** the gas. When the gas is compressed, $W$ is negative.', '$\\Delta U$ depends only on the temperature change, so two paths between the same states have the same $\\Delta U$ but different $Q$ and $W$.', 'Efficiency uses the heat **taken in**, not the total heat exchanged, in the denominator.'],
      ja: ['$Q = \\Delta U + W$ の $W$ は気体**が**した仕事。圧縮では $W$ は負。', '$\\Delta U$ は温度変化だけで決まるので、同じ2状態間の経路が違っても $\\Delta U$ は同じで $Q$ と $W$ が違う。', '熱効率の分母は**受け取った**熱であり、やりとりした熱の合計ではない。'],
    },
    followups: {
      en: ['Why does a gas cool when it expands adiabatically?', 'Compare Q for isobaric and isothermal expansion between the same volumes.', 'Show me how to get net work from a rectangular cycle on a p–V diagram.', 'Why can no engine be 100% efficient?'],
      ja: ['断熱膨張で気体が冷えるのはなぜ？', '同じ体積間の定圧膨張と等温膨張で Q を比べて。', 'p–V 図の長方形サイクルから正味の仕事を求める方法を見せて。', '熱効率100%の熱機関が不可能なのはなぜ？'],
    },
  },
  {
    id: 'ideal-gas',
    core: {
      en: 'For a fixed amount of gas, pV/T is constant — so pV = nRT. Fewer molecules per volume or slower molecules mean less pressure. Every gas problem is "write pV = nRT for each state (or each gas) and compare".',
      ja: '一定量の気体では pV/T が一定 — つまり pV = nRT。体積あたりの分子が少ないか、分子が遅ければ圧力は小さい。気体の問題はすべて「各状態（または各気体）で pV = nRT を書いて比べる」。',
    },
    body: {
      en: r`## The laws (all special cases of one equation)
| law | fixed | statement |
|---|---|---|
| Boyle | $T$ | $pV = $ const |
| Charles | $p$ | $V/T = $ const (V ∝ absolute T) |
| Boyle–Charles | $n$ | $\dfrac{pV}{T} = $ const |
| ideal gas | — | $pV = nRT$, $R = 8.31$ J/(mol·K) |

$T$ must be in **kelvin**. At 0 °C and 1 atm ($1.013\times10^5$ Pa), 1 mol occupies 22.4 L.

## How to use it
- Two states of the same gas: $\dfrac{p_1V_1}{T_1} = \dfrac{p_2V_2}{T_2}$.
- Two gases / two containers connected: write $pV = nRT$ for each, and note what is shared (same $p$ after a valve opens, same $T$ if in the same bath). Total moles are conserved when gases mix.
- Piston problems: the gas pressure is set by force balance on the piston: $pS = p_0 S + Mg$ (vertical) — then use $pV = nRT$.

## Graphs
- $p$ vs $V$ at fixed $T$: hyperbola (isotherm); higher $T$ → curve further from the origin.
- $V$ vs $T$ at fixed $p$: straight line **through the origin** in kelvin (through −273 °C in Celsius).
- $p$ vs $T$ at fixed $V$: straight line through the origin.

## Mixtures (partial pressure)
Each gas acts as if alone: $p_i V = n_i RT$; total $p = \sum p_i$ (Dalton). Mole fraction = pressure fraction.

## Real vs ideal
Ideal gas ignores molecular volume and attractions. Real gases behave ideally at **low pressure and high temperature**; they deviate near liquefaction.`,
      ja: r`## 法則（すべて1つの式の特別な場合）
| 法則 | 一定 | 内容 |
|---|---|---|
| ボイル | $T$ | $pV = $ 一定 |
| シャルル | $p$ | $V/T = $ 一定（V ∝ 絶対温度） |
| ボイル・シャルル | $n$ | $\dfrac{pV}{T} = $ 一定 |
| 状態方程式 | — | $pV = nRT$、$R = 8.31$ J/(mol·K) |

$T$ は必ず**ケルビン**。0 °C、1 atm（$1.013\times10^5$ Pa）で 1 mol は 22.4 L。

## 使い方
- 同じ気体の2状態：$\dfrac{p_1V_1}{T_1} = \dfrac{p_2V_2}{T_2}$。
- 2つの気体・つながった2容器：それぞれ $pV = nRT$ を書き、共通のものを確認（コックを開けた後は同じ $p$、同じ恒温槽なら同じ $T$）。混合しても物質量の合計は保存。
- ピストンの問題：気体の圧力はピストンの力のつり合いで決まる：$pS = p_0 S + Mg$（鉛直）— それから $pV = nRT$。

## グラフ
- $T$ 一定の $p$–$V$：双曲線（等温線）。$T$ が高いほど原点から遠い。
- $p$ 一定の $V$–$T$：ケルビンなら**原点を通る**直線（摂氏なら −273 °C を通る）。
- $V$ 一定の $p$–$T$：原点を通る直線。

## 混合気体（分圧）
各気体は単独のようにふるまう：$p_i V = n_i RT$、全圧 $p = \sum p_i$（ドルトン）。モル分率 = 圧力の割合。

## 実在気体と理想気体
理想気体は分子の体積と引力を無視。実在気体は**低圧・高温**で理想気体に近く、液化しそうな条件でずれる。`,
    },
    exam: {
      en: ['Two containers joined by a valve at different pressures: final pressure after opening (moles conserved, $T$ fixed).', 'Vertical cylinder with a heavy piston: heat the gas — how much does the piston rise? ($p$ fixed by the piston, so $V \\propto T$).', 'Choose the correct graph ($V$–$T$ line through absolute zero, $p$–$V$ isotherms).'],
      ja: ['圧力の異なる2容器をコックでつなぐ：開けた後の圧力（物質量保存、$T$ 一定）。', '重いピストンつきの鉛直シリンダー：気体を加熱するとピストンはどれだけ上がるか（$p$ はピストンで決まるので $V \\propto T$）。', '正しいグラフを選ぶ（絶対零度を通る $V$–$T$ 直線、$p$–$V$ 等温線）。'],
    },
    traps: {
      en: ['Never plug °C into $pV = nRT$ or into ratios like $V_1/T_1 = V_2/T_2$.', 'A piston that is free to move keeps the pressure fixed, not the volume.', '"Same temperature" for connected containers is only true if the question says so (or after a long time in the same room).'],
      ja: ['$pV = nRT$ や $V_1/T_1 = V_2/T_2$ に °C を入れない。', '自由に動くピストンは圧力を一定に保つのであって、体積ではない。', 'つながった容器が「同じ温度」なのは問題文にそう書いてあるとき（または同じ部屋で長時間たった後）だけ。'],
    },
    followups: {
      en: ['Why must temperature be in kelvin for these laws?', 'Solve the two-container valve problem with numbers.', 'How does the piston set the gas pressure? Show the force balance.', 'Why do real gases deviate from ideal behaviour at high pressure?'],
      ja: ['なぜこれらの法則では温度をケルビンにする必要があるの？', 'コックでつないだ2容器の問題を数値で解いて。', 'ピストンが気体の圧力を決めるしくみを力のつり合いで見せて。', '高圧で実在気体が理想気体からずれるのはなぜ？'],
    },
  },
  {
    id: 'gas-molecules',
    core: {
      en: 'Gas pressure is molecules hitting the walls; temperature is their average kinetic energy. Kinetic theory turns this into pV = (1/3)Nm⟨v²⟩, and comparing with pV = nRT gives the key result: average KE per molecule = (3/2)kT — the same for every gas at the same temperature.',
      ja: '気体の圧力は分子が壁にぶつかることで生じ、温度は分子の平均運動エネルギー。分子運動論はこれを pV = (1/3)Nm⟨v²⟩ にし、pV = nRT と比べると核心の結果「分子1個の平均運動エネルギー = (3/2)kT」が出る — 同じ温度ならどの気体でも同じ。',
    },
    body: {
      en: r`## Where pressure comes from (the derivation outline)
One molecule of mass $m$, $x$-velocity $v_x$, in a cube of side $L$:
1. Each wall hit reverses $v_x$: impulse on the wall $2mv_x$.
2. Hits per second: $v_x/2L$.
3. Average force from one molecule: $mv_x^2/L$. For $N$ molecules with $\langle v_x^2\rangle = \tfrac13\langle v^2\rangle$:
$$p = \frac{Nm\langle v^2\rangle}{3V} \quad\Rightarrow\quad pV = \tfrac13 Nm\langle v^2\rangle$$

## Temperature is kinetic energy
Compare with $pV = nRT = NkT$ ($k = R/N_A = 1.38\times10^{-23}$ J/K):
$$\tfrac12 m\langle v^2\rangle = \tfrac32 kT$$
- Average KE depends **only on $T$**, not on the gas.
- Root-mean-square speed $v_{rms} = \sqrt{3kT/m} = \sqrt{3RT/M}$: at the same $T$, lighter molecules move faster (H₂ ≈ 4× faster than O₂).
:::fig maxwell-speeds

## Internal energy
| gas | degrees of freedom | $U$ | $C_V$ (per mol) | $C_p$ |
|---|---|---|---|---|
| monatomic (He, Ar) | 3 (translation) | $\tfrac32 nRT$ | $\tfrac32 R$ | $\tfrac52 R$ |
| diatomic (N₂, O₂) | 5 (+ 2 rotation) | $\tfrac52 nRT$ | $\tfrac52 R$ | $\tfrac72 R$ |

$C_p - C_V = R$ always (Mayer's relation): at constant pressure the gas also does work $p\Delta V = nR\Delta T$, so it needs $R$ more heat per mole per kelvin.

## Why this matters for problems
"Internal energy of the gas" in the first law is $\tfrac32 nRT$ (monatomic) — so $\Delta U = \tfrac32 nR\Delta T = \tfrac32 (p_2V_2 - p_1V_1)$. That last form lets you compute $\Delta U$ straight from a $p$–$V$ diagram.`,
      ja: r`## 圧力の正体（導出の流れ）
質量 $m$、$x$ 方向速度 $v_x$ の分子1個、一辺 $L$ の立方体：
1. 壁に当たるたび $v_x$ が反転：壁への力積 $2mv_x$。
2. 1秒あたりの衝突回数：$v_x/2L$。
3. 分子1個の平均の力：$mv_x^2/L$。$N$ 個で $\langle v_x^2\rangle = \tfrac13\langle v^2\rangle$ とすると
$$p = \frac{Nm\langle v^2\rangle}{3V} \quad\Rightarrow\quad pV = \tfrac13 Nm\langle v^2\rangle$$

## 温度は運動エネルギー
$pV = nRT = NkT$（$k = R/N_A = 1.38\times10^{-23}$ J/K）と比べると
$$\tfrac12 m\langle v^2\rangle = \tfrac32 kT$$
- 平均運動エネルギーは**$T$ だけ**で決まり、気体の種類によらない。
- 二乗平均速度 $v_{rms} = \sqrt{3kT/m} = \sqrt{3RT/M}$：同じ $T$ なら軽い分子ほど速い（H₂ は O₂ の約4倍）。
:::fig maxwell-speeds

## 内部エネルギー
| 気体 | 自由度 | $U$ | $C_V$（1 mol） | $C_p$ |
|---|---|---|---|---|
| 単原子（He, Ar） | 3（並進） | $\tfrac32 nRT$ | $\tfrac32 R$ | $\tfrac52 R$ |
| 二原子（N₂, O₂） | 5（＋回転2） | $\tfrac52 nRT$ | $\tfrac52 R$ | $\tfrac72 R$ |

常に $C_p - C_V = R$（マイヤーの関係）：定圧では気体が仕事 $p\Delta V = nR\Delta T$ もするので、1 mol・1 K あたり $R$ だけ余分に熱が必要。

## 問題での使いどころ
第一法則の「気体の内部エネルギー」は（単原子）$\tfrac32 nRT$ — よって $\Delta U = \tfrac32 nR\Delta T = \tfrac32 (p_2V_2 - p_1V_1)$。最後の形を使えば $p$–$V$ 図から直接 $\Delta U$ が計算できる。`,
    },
    exam: {
      en: ['How does $v_{rms}$ change when $T$ doubles (×√2) or when the gas is heavier?', 'Two gases at the same temperature: compare average KE (equal) and speeds (lighter faster).', '$\\Delta U$ between two points on a $p$–$V$ diagram using $\\tfrac32(pV)$.'],
      ja: ['$T$ を2倍にすると $v_{rms}$ は（√2 倍）、重い気体では？', '同じ温度の2種の気体：平均運動エネルギー（等しい）と速さ（軽い方が速い）の比較。', '$p$–$V$ 図上の2点間の $\\Delta U$ を $\\tfrac32(pV)$ で計算。'],
    },
    traps: {
      en: ['Average KE ∝ $T$, but average **speed** ∝ $\\sqrt{T}$.', 'Not every molecule has the same speed — there is a distribution; "$v_{rms}$" is a typical value.', 'Diatomic gases have $U = \\tfrac52 nRT$; using $\\tfrac32$ for air gives the wrong $\\Delta U$.'],
      ja: ['平均運動エネルギー ∝ $T$ だが、平均の**速さ** ∝ $\\sqrt{T}$。', 'すべての分子が同じ速さではない — 分布がある。「$v_{rms}$」は代表値。', '二原子分子気体は $U = \\tfrac52 nRT$。空気に $\\tfrac32$ を使うと $\\Delta U$ を間違える。'],
    },
    followups: {
      en: ['Walk me through the kinetic-theory derivation of pV = ⅓Nm⟨v²⟩ slowly.', 'Why is the average kinetic energy the same for all gases at the same T?', 'Why does a diatomic gas store more internal energy than a monatomic one?', 'Explain Cp − CV = R with the first law.'],
      ja: ['pV = ⅓Nm⟨v²⟩ の導出をゆっくり見せて。', '同じ温度ならどの気体も平均運動エネルギーが同じなのはなぜ？', '二原子分子気体が単原子より多くの内部エネルギーを蓄えるのはなぜ？', '第一法則で Cp − CV = R を説明して。'],
    },
  },
  {
    id: 'gas-state-change',
    core: {
      en: 'Each named process fixes one variable, which fixes what Q, ΔU and W do. Draw the p–V diagram: work is the area under the curve, ΔU comes from the temperature change, and Q is whatever is left over in Q = ΔU + W.',
      ja: '名前のついた各変化は1つの変数を固定し、それで Q・ΔU・W の様子が決まる。p–V 図を描く：仕事は曲線の下の面積、ΔU は温度変化から、Q は Q = ΔU + W の残り。',
    },
    body: {
      en: r`## The four processes at a glance
:::fig pv-diagram

| process | on $p$–$V$ | $W$ (by gas) | $\Delta U$ (monatomic) | $Q$ |
|---|---|---|---|---|
| isochoric | vertical line | 0 | $\tfrac32 nR\Delta T$ | $= \Delta U = nC_V\Delta T$ |
| isobaric | horizontal line | $p\Delta V = nR\Delta T$ | $\tfrac32 nR\Delta T$ | $nC_p\Delta T = \tfrac52 nR\Delta T$ |
| isothermal | hyperbola | area (= $Q$) | 0 | $= W$ |
| adiabatic | steeper than isotherm | $= -\Delta U$ | $-W$ | 0 |

## Two ways to get ΔU without knowing T
$\Delta U = \tfrac32 nR\Delta T = \tfrac32 (p_2 V_2 - p_1 V_1)$ (monatomic). If the question gives a $p$–$V$ diagram with numbers, this is the fastest route.

## Molar specific heats
$C_V = \tfrac32 R$, $C_p = \tfrac52 R$ (monatomic); $\gamma = C_p/C_V = 5/3$. For the same $\Delta T$, isobaric heating needs **more** heat than isochoric because part of it becomes work.

## Adiabatic change
No heat exchange (fast, or insulated). $pV^\gamma = $ const and $TV^{\gamma-1} = $ const. Compressing quickly (bicycle pump) heats the gas; letting it expand quickly (spray can) cools it. On the diagram the adiabat is steeper than the isotherm through the same point.

## Comparing paths (the EJU archetype)
From state A to state B via different routes:
- $\Delta U$ is the **same** for all routes (it depends only on A and B).
- $W$ is the area under each route — bigger for the route that runs at higher pressure.
- Therefore $Q = \Delta U + W$ ranks in the same order as $W$.
For a cycle, $\Delta U_{total} = 0$ and net $W$ = enclosed area; heat is absorbed on legs where $Q > 0$ — typically expansions and heating at constant volume.`,
      ja: r`## 4つの変化をひと目で
:::fig pv-diagram

| 変化 | $p$–$V$ 図 | $W$（気体がした） | $\Delta U$（単原子） | $Q$ |
|---|---|---|---|---|
| 定積 | 鉛直線 | 0 | $\tfrac32 nR\Delta T$ | $= \Delta U = nC_V\Delta T$ |
| 定圧 | 水平線 | $p\Delta V = nR\Delta T$ | $\tfrac32 nR\Delta T$ | $nC_p\Delta T = \tfrac52 nR\Delta T$ |
| 等温 | 双曲線 | 面積（= $Q$） | 0 | $= W$ |
| 断熱 | 等温線より急 | $= -\Delta U$ | $-W$ | 0 |

## T を知らずに ΔU を出す2つの方法
$\Delta U = \tfrac32 nR\Delta T = \tfrac32 (p_2 V_2 - p_1 V_1)$（単原子）。数値入りの $p$–$V$ 図が与えられたら、これが最速。

## モル比熱
$C_V = \tfrac32 R$、$C_p = \tfrac52 R$（単原子）、$\gamma = C_p/C_V = 5/3$。同じ $\Delta T$ なら定圧加熱の方が定積より**多く**熱が必要。一部が仕事になるから。

## 断熱変化
熱の出入りなし（速い、または断熱容器）。$pV^\gamma = $ 一定、$TV^{\gamma-1} = $ 一定。急に圧縮（自転車の空気入れ）すると熱くなり、急に膨張（スプレー缶）させると冷える。図では同じ点を通る等温線より断熱線の方が急。

## 経路の比較（EJUの定番）
状態 A から B へ異なる経路で：
- $\Delta U$ はどの経路でも**同じ**（A と B だけで決まる）。
- $W$ は各経路の下の面積 — 高い圧力を通る経路ほど大きい。
- よって $Q = \Delta U + W$ の大小は $W$ の順と同じ。
サイクルでは $\Delta U_{合計} = 0$ で正味の $W$ = 囲まれた面積。熱を吸収するのは $Q > 0$ の過程 — ふつう膨張と定積での加熱。`,
    },
    exam: {
      en: ['Rank $Q$ for paths A→B (isobaric+isochoric vs isothermal vs adiabatic); or identify the process in which $U$ decreases.', 'Net heat absorbed over a cycle or over a two-leg path from a numbered $p$–$V$ diagram.', 'Heat needed to raise $n$ mol by $\\Delta T$ at constant $p$ vs constant $V$ (ratio 5:3).'],
      ja: ['A→B の各経路（定圧＋定積、等温、断熱）の $Q$ の大小、または $U$ が減る過程はどれか。', '数値つき $p$–$V$ 図でのサイクルや2過程の正味の吸熱。', '$n$ mol を $\\Delta T$ 上げるのに必要な熱、定圧と定積の比（5:3）。'],
    },
    traps: {
      en: ['Isothermal does **not** mean no heat — heat flows in exactly as fast as work is done.', 'Adiabatic does **not** mean constant temperature — the temperature changes because $\\Delta U = -W$.', 'Work is area under the curve **on the $p$–$V$ diagram**, not on a $p$–$T$ or $V$–$T$ graph.'],
      ja: ['等温は熱の出入りが**ない**という意味ではない — 仕事をした分だけ熱が入る。', '断熱は温度一定という意味では**ない** — $\\Delta U = -W$ で温度は変わる。', '仕事は**$p$–$V$ 図**での曲線の下の面積であり、$p$–$T$ や $V$–$T$ のグラフではない。'],
    },
    followups: {
      en: ['Why is Q larger for the isobaric route than the isothermal one between the same volumes?', 'Explain why the adiabat is steeper than the isotherm.', 'Show a full cycle example: compute W, ΔU and Q on each leg.', 'Where does the 5/3 ratio of Cp to CV come from?'],
      ja: ['同じ体積間で定圧経路の Q が等温経路より大きいのはなぜ？', '断熱線が等温線より急な理由を説明して。', 'サイクルの例で各過程の W・ΔU・Q を全部計算して見せて。', 'Cp と CV の比 5/3 はどこから来るの？'],
    },
  },
  // ───────────────────────────── WAVES ─────────────────────────────
  {
    id: 'wave-properties',
    core: {
      en: 'A wave carries energy, not matter: each bit of the medium just oscillates in place while the pattern moves at speed v = fλ. Read λ from a snapshot (y–x graph) and T from a single point\'s history (y–t graph); the medium\'s velocity at a point is the slope of the y–t curve, not the wave speed.',
      ja: '波はエネルギーを運び物質は運ばない：媒質の各点はその場で振動し、パターンだけが速さ v = fλ で進む。λ はある瞬間の形（y–x グラフ）から、T は1点の時間変化（y–t グラフ）から読む。媒質の速度は y–t の傾きで、波の速さとは別物。',
    },
    body: {
      en: r`## Vocabulary
- **Transverse**: medium moves ⊥ to travel (string, light). **Longitudinal**: medium moves ∥ to travel (sound; drawn as compressions and rarefactions).
- Amplitude $A$, wavelength $\lambda$ (distance between repeats), period $T$ (time between repeats), frequency $f = 1/T$.
- $$v = f\lambda = \lambda/T$$ Speed is set by the **medium** (tension and mass of a string; temperature of air), frequency by the **source**. Change the medium → $v$ and $\lambda$ change, $f$ does not.

## The two graphs
:::fig wave-snapshot

| graph | horizontal axis | you can read | slope means |
|---|---|---|---|
| $y$–$x$ (snapshot) | position | $\lambda$, $A$ | — |
| $y$–$t$ (one point) | time | $T$, $A$ | velocity of the medium |

**Which way is the medium moving?** Shift the snapshot slightly in the travel direction and see whether each point goes up or down. For a wave moving right, a point on the rising slope ahead of a crest moves **down**, a point just behind a crest… draw it, do not guess.

## Sinusoidal wave equation
Wave travelling in $+x$: $y(x,t) = A\sin 2\pi\left(\dfrac{t}{T} - \dfrac{x}{\lambda}\right)$; in $-x$: change the minus to plus. A point at larger $x$ lags in phase by $2\pi x/\lambda$ — that is what "$-x/\lambda$" means.

## Phase
Two points $\lambda$ apart (or $T$ apart in time) are **in phase**; $\lambda/2$ apart are **in antiphase** (opposite displacement).

## Energy
Wave energy ∝ $A^2 f^2$. A point source spreads energy over a growing sphere, so intensity ∝ $1/r^2$.`,
      ja: r`## 用語
- **横波**：媒質が進行方向に垂直に振動（弦、光）。**縦波**：媒質が進行方向に平行に振動（音。密と疎で描く）。
- 振幅 $A$、波長 $\lambda$（繰り返しの距離）、周期 $T$（繰り返しの時間）、振動数 $f = 1/T$。
- $$v = f\lambda = \lambda/T$$ 速さは**媒質**が決める（弦の張力と線密度、空気の温度）、振動数は**波源**が決める。媒質が変わると $v$ と $\lambda$ が変わり、$f$ は変わらない。

## 2つのグラフ
:::fig wave-snapshot

| グラフ | 横軸 | 読めるもの | 傾きの意味 |
|---|---|---|---|
| $y$–$x$（波形） | 位置 | $\lambda$、$A$ | — |
| $y$–$t$（1点） | 時間 | $T$、$A$ | 媒質の速度 |

**媒質はどちらへ動いている？** 波形を進行方向にほんの少しずらし、各点が上がるか下がるかを見る。右へ進む波では、山の前の上り坂の点は**下**へ動く…推測せず描く。

## 正弦波の式
$+x$ 向きに進む波：$y(x,t) = A\sin 2\pi\left(\dfrac{t}{T} - \dfrac{x}{\lambda}\right)$、$-x$ 向きならマイナスをプラスに。$x$ が大きい点ほど位相が $2\pi x/\lambda$ 遅れる — 「$-x/\lambda$」の意味はそれ。

## 位相
$\lambda$（時間なら $T$）離れた2点は**同位相**、$\lambda/2$ 離れた2点は**逆位相**（変位が逆）。

## エネルギー
波のエネルギー ∝ $A^2 f^2$。点波源は広がる球面にエネルギーを配るので、強さ ∝ $1/r^2$。`,
    },
    exam: {
      en: ['Given a $y$–$x$ snapshot and the frequency/direction: the first time the displacement at point P is maximum; the wave shape a little later; the medium velocity direction at a point (block III, most years).', 'Write $y = A\\sin(\\ldots)$ from a graph, or read $T$ and $\\lambda$ from two graphs and compute $v$.', 'Longitudinal wave drawn as a transverse graph: where are the compressions (points of zero displacement with neighbours moving toward them).'],
      ja: ['$y$–$x$ の波形と振動数・向きが与えられ：点 P の変位が初めて最大になる時刻、少し後の波形、ある点の媒質の速度の向き（大問 III、ほぼ毎年）。', 'グラフから $y = A\\sin(\\ldots)$ を書く、2つのグラフから $T$ と $\\lambda$ を読んで $v$。', '縦波を横波表示したグラフ：密の位置はどこか（変位0で両隣が近づいてくる点）。'],
    },
    traps: {
      en: ['Wave speed $v$ and medium velocity are different things; the medium at a crest is momentarily **at rest**.', 'Refraction into a new medium keeps $f$ and changes $\\lambda$ — not the other way round.', 'A longitudinal wave is often drawn as if transverse (displacement in the travel direction plotted upward). Compressions are at $y = 0$ crossing points, not at the "crests".'],
      ja: ['波の速さ $v$ と媒質の速度は別物。山の位置の媒質は一瞬**静止**している。', '別の媒質に入る（屈折）と $f$ は変わらず $\\lambda$ が変わる。逆ではない。', '縦波は横波のように描かれることが多い（進行方向の変位を上向きにプロット）。密は「山」ではなく $y = 0$ の交点。'],
    },
    followups: {
      en: ['How do I decide which way a point on the string is moving from a snapshot?', 'Explain the sign in y = A sin 2π(t/T − x/λ).', 'Why does frequency stay the same when a wave changes medium?', 'Where are the compressions in a longitudinal wave drawn as a graph?'],
      ja: ['波形からある点の媒質がどちらに動くかをどう判断する？', 'y = A sin 2π(t/T − x/λ) の符号を説明して。', '媒質が変わっても振動数が変わらないのはなぜ？', 'グラフで描いた縦波で密の位置はどこ？'],
    },
  },
  {
    id: 'wave-superposition',
    core: {
      en: 'Waves add: the displacement at a point is the sum of every wave passing through it. Two waves of the same wavelength travelling opposite ways add up to a standing wave with nodes λ/2 apart. Reflection at a fixed end flips the wave; at a free end it does not — that decides whether the end is a node or an antinode.',
      ja: '波は足し算：ある点の変位はそこを通るすべての波の和。同じ波長で逆向きに進む2つの波を足すと、節が λ/2 おきの定在波になる。固定端では反射で波が反転し、自由端では反転しない — それが端が節か腹かを決める。',
    },
    body: {
      en: r`## Superposition and interference
Displacements simply add. Two sources in phase:
- Path difference $= m\lambda$ → constructive (loud/bright).
- Path difference $= (m + \tfrac12)\lambda$ → destructive (silent/dark).
If the sources are in antiphase, swap the two conditions. Sound "beats" are interference in time (see Sound).

## Reflection at an end
| end | example | reflected wave | what forms there |
|---|---|---|---|
| fixed | string tied to wall, closed pipe end | **inverted** (phase change π) | node |
| free | string on a ring, open pipe end | not inverted | antinode |

Sketch the reflected pulse: imagine the wave continuing past the end, then flip it back (and upside down for a fixed end).

## Standing (stationary) waves
:::fig standing-wave

Incident + reflected wave with the same $A$, $\lambda$:
- **Nodes** (never move) every $\lambda/2$; **antinodes** (amplitude $2A$) midway between.
- All points between two nodes move in phase; across a node the phase flips.
- Node-to-node distance $= \lambda/2$ — this is how you read $\lambda$ off a standing-wave picture.

## Huygens' principle → reflection and refraction
Every point on a wavefront is a source of small wavelets; the new wavefront is their envelope. Consequences:
- **Reflection**: angle in = angle out.
- **Refraction**: $\dfrac{\sin i}{\sin r} = \dfrac{v_1}{v_2} = \dfrac{\lambda_1}{\lambda_2} = n_{12}$. Slower medium → bends toward the normal.
- **Diffraction**: waves spread around obstacles/through gaps; noticeable when the gap is comparable to $\lambda$ (sound diffracts around corners, light barely does).`,
      ja: r`## 重ね合わせと干渉
変位はそのまま足す。同位相の2波源：
- 経路差 $= m\lambda$ → 強め合う（大きい・明るい）。
- 経路差 $= (m + \tfrac12)\lambda$ → 弱め合う（無音・暗い）。
波源が逆位相なら2つの条件を入れかえる。音の「うなり」は時間の上での干渉（音のトピック参照）。

## 端での反射
| 端 | 例 | 反射波 | できるもの |
|---|---|---|---|
| 固定端 | 壁に結んだ弦、閉管の底 | **反転**（位相が π ずれる） | 節 |
| 自由端 | 輪で吊った弦、開管の口 | 反転しない | 腹 |

反射パルスの描き方：波を端の向こうまで続けたと考え、折り返す（固定端ならさらに上下反転）。

## 定在波（定常波）
:::fig standing-wave

同じ $A$、$\lambda$ の入射波＋反射波：
- **節**（動かない）が $\lambda/2$ おき、**腹**（振幅 $2A$）がその中間。
- 隣り合う節の間の点はすべて同位相、節をまたぐと位相が反転。
- 節から節の距離 $= \lambda/2$ — 定在波の図から $\lambda$ を読むのはこれ。

## ホイヘンスの原理 → 反射・屈折
波面上の各点が小さな素元波の波源になり、それらの包絡面が次の波面。帰結：
- **反射**：入射角 = 反射角。
- **屈折**：$\dfrac{\sin i}{\sin r} = \dfrac{v_1}{v_2} = \dfrac{\lambda_1}{\lambda_2} = n_{12}$。遅い媒質へ入ると法線側へ曲がる。
- **回折**：波は障害物の後ろやすき間の先へ広がる。すき間が $\lambda$ 程度のとき目立つ（音は角を回り込むが光はほとんど回り込まない）。`,
    },
    exam: {
      en: ['Two pulses approaching each other: draw the shape at the moment they overlap (add point by point).', 'Standing-wave picture on a string: find $\\lambda$, $f$, or which points are at rest / in phase.', 'Two in-phase point sources on a water surface: how many lines of constructive interference between them ($|d_1 - d_2| = m\\lambda$ with $|d_1-d_2| < D$).'],
      ja: ['向かい合って進む2つのパルス：重なる瞬間の形（点ごとに足す）。', '弦の定在波の図：$\\lambda$、$f$、静止している点・同位相の点。', '水面の同位相の2点波源：強め合う線の本数（$|d_1 - d_2| = m\\lambda$、$|d_1-d_2| < D$）。'],
    },
    traps: {
      en: ['A standing wave does not travel — energy is not transported along it.', 'The distance between adjacent nodes is $\\lambda/2$, not $\\lambda$.', 'Fixed-end reflection inverts the wave (crest returns as trough); free-end reflection returns a crest as a crest.'],
      ja: ['定在波は進まない — エネルギーは運ばれない。', '隣り合う節の間隔は $\\lambda$ ではなく $\\lambda/2$。', '固定端反射は波が反転（山が谷で戻る）。自由端反射は山が山のまま戻る。'],
    },
    followups: {
      en: ['Why does a fixed end invert the reflected wave?', 'Show me how to draw two overlapping pulses step by step.', 'Why are nodes λ/2 apart, not λ?', 'Explain refraction with Huygens wavelets and a picture in words.'],
      ja: ['固定端で反射波が反転するのはなぜ？', '重なる2つのパルスの描き方を順に見せて。', '節の間隔が λ ではなく λ/2 なのはなぜ？', 'ホイヘンスの素元波で屈折を言葉の絵で説明して。'],
    },
  },
  {
    id: 'sound',
    core: {
      en: 'A string or air column can only vibrate at frequencies whose standing-wave pattern fits its length. Fixed ends / closed ends are nodes, open ends are antinodes; fit the pattern, read λ, then f = v/λ. Change tension, length or the gas and you change v or λ — the rest is proportional reasoning.',
      ja: '弦や気柱は、定在波のパターンが長さにちょうど収まる振動数でしか振動できない。固定端・閉端は節、開口端は腹。パターンをはめて λ を読み、f = v/λ。張力・長さ・気体を変えれば v か λ が変わる — あとは比例の計算。',
    },
    body: {
      en: r`## Speed of sound
In air $v \approx 331.5 + 0.6t$ m/s ($t$ in °C): faster when warmer, independent of pressure and of the sound's frequency. Faster in liquids and solids. Audible range ≈ 20 Hz–20 kHz.

## Beats
Two tones $f_1$, $f_2$ close together: loudness pulses at the **beat frequency** $|f_1 - f_2|$. Used to tune instruments; "3 beats per second" means the unknown is $f \pm 3$ Hz — decide which by what happens when tension is increased.

## String fixed at both ends
:::fig standing-wave

Length $L$ must hold whole half-wavelengths: $L = n\dfrac{\lambda}{2}$, so $f_n = \dfrac{nv}{2L}$ ($n = 1, 2, 3\ldots$). Fundamental $f_1 = v/2L$; harmonics are all integer multiples.
Wave speed on a string: $v = \sqrt{\dfrac{S}{\rho}}$ ($S$ tension, $\rho$ mass per length). So $f_1 = \dfrac{1}{2L}\sqrt{\dfrac{S}{\rho}}$: **4× the tension → 2× the frequency**; half the length → 2× the frequency.

## Air columns
| pipe | ends | allowed lengths | frequencies |
|---|---|---|---|
| open both ends | antinode–antinode | $L = n\lambda/2$ | $f_n = nv/2L$, all harmonics |
| closed one end | node (closed)–antinode (open) | $L = (2n-1)\lambda/4$ | $f = v/4L,\ 3v/4L,\ 5v/4L$ — **odd** harmonics only |

**Resonance tube experiment**: a tuning fork over a tube whose water level is lowered; resonance at lengths $L_1$ and $L_2$. Then $\lambda = 2(L_2 - L_1)$ (this cancels the end correction), and $v = f\lambda$. The open-end correction $\Delta L$: the antinode sits a little outside the tube, $L_1 + \Delta L = \lambda/4$.

## Reading a resonance picture
Count nodes/antinodes, express $L$ in quarter-wavelengths, solve for $\lambda$. Everything else follows from $v = f\lambda$.`,
      ja: r`## 音速
空気中で $v \approx 331.5 + 0.6t$ m/s（$t$ は °C）：温かいほど速く、気圧や音の振動数にはよらない。液体・固体中ではもっと速い。可聴域 ≈ 20 Hz〜20 kHz。

## うなり
近い振動数 $f_1$、$f_2$ の2音：音の大きさが**うなりの振動数** $|f_1 - f_2|$ で脈打つ。楽器の調律に使う。「毎秒3回のうなり」なら未知の音は $f \pm 3$ Hz — どちらかは張力を上げたときの変化で判断。

## 両端固定の弦
:::fig standing-wave

長さ $L$ に半波長が整数個入る：$L = n\dfrac{\lambda}{2}$、よって $f_n = \dfrac{nv}{2L}$（$n = 1, 2, 3\ldots$）。基本振動 $f_1 = v/2L$、倍音はすべて整数倍。
弦を伝わる波の速さ：$v = \sqrt{\dfrac{S}{\rho}}$（$S$ 張力、$\rho$ 線密度）。よって $f_1 = \dfrac{1}{2L}\sqrt{\dfrac{S}{\rho}}$：**張力4倍 → 振動数2倍**、長さ半分 → 振動数2倍。

## 気柱
| 管 | 両端 | 許される長さ | 振動数 |
|---|---|---|---|
| 開管（両端開） | 腹–腹 | $L = n\lambda/2$ | $f_n = nv/2L$、すべての倍音 |
| 閉管（一端閉） | 節（閉）–腹（開） | $L = (2n-1)\lambda/4$ | $f = v/4L,\ 3v/4L,\ 5v/4L$ — **奇数**倍音のみ |

**気柱共鳴の実験**：音叉を管の口に置き水面を下げる。長さ $L_1$、$L_2$ で共鳴。$\lambda = 2(L_2 - L_1)$（開口端補正が消える）、$v = f\lambda$。開口端補正 $\Delta L$：腹は管の少し外にあり、$L_1 + \Delta L = \lambda/4$。

## 共鳴の図の読み方
節と腹を数え、$L$ を四分の一波長の個数で表し、$\lambda$ を求める。あとは $v = f\lambda$。`,
    },
    exam: {
      en: ['String: tension or length changed so the frequency matches another string — find the ratio (uses $f \\propto \\sqrt{S}/L$; block III, frequent).', 'Closed pipe with $n$ antinodes drawn: which harmonic, what happens to $f$ if the gas or temperature changes.', 'Resonance tube: $\\lambda$ and $v$ from $L_1$, $L_2$; the end correction.'],
      ja: ['弦：別の弦と振動数を合わせるために張力や長さを変える — 比を求める（$f \\propto \\sqrt{S}/L$、大問 III 頻出）。', '腹が $n$ 個描かれた閉管：何倍音か、気体や温度を変えると $f$ はどうなるか。', '気柱共鳴：$L_1$、$L_2$ から $\\lambda$ と $v$、開口端補正。'],
    },
    traps: {
      en: ['A closed pipe has **only odd** harmonics; the "second resonance" is the 3rd harmonic at $3f_1$.', 'Warming the air raises $v$ and therefore $f$ of a pipe (λ fixed by length) — but does **not** change a string\'s frequency.', 'Beat frequency is the **difference**, and beats are heard only when the difference is small (a few Hz).'],
      ja: ['閉管には**奇数**倍音しかない。「2回目の共鳴」は $3f_1$ の3倍音。', '空気を温めると $v$ が上がるので管の $f$ も上がる（$\\lambda$ は長さで固定）— しかし弦の振動数は変わ**らない**。', 'うなりの振動数は**差**。差が小さい（数 Hz）ときだけ聞こえる。'],
    },
    followups: {
      en: ['Why does a closed pipe skip the even harmonics?', 'Derive f₁ = (1/2L)√(S/ρ) from the standing-wave condition.', 'Explain the end correction and why L₂ − L₁ removes it.', 'How do I tell whether the unknown fork is higher or lower using beats?'],
      ja: ['閉管に偶数倍音がないのはなぜ？', '定在波の条件から f₁ = (1/2L)√(S/ρ) を導いて。', '開口端補正と、L₂ − L₁ でそれが消える理由を説明して。', 'うなりを使って未知の音叉が高いか低いかをどう判断する？'],
    },
  },
  {
    id: 'doppler',
    core: {
      en: 'A moving source squeezes the wavelength in front of it (the sound itself still travels at V); a moving observer meets wavefronts faster or slower. Both effects sit in one formula: f′ = f × (V ∓ v_observer)/(V ∓ v_source), with the signs chosen so that approaching raises the pitch.',
      ja: '動く音源は前方の波長を縮める（音そのものはやはり V で進む）。動く観測者は波面に出会う速さが変わる。両方が1つの式にまとまる：f′ = f × (V ∓ v_観測者)/(V ∓ v_音源)。符号は「近づくと高くなる」ように選ぶ。',
    },
    body: {
      en: r`## The single formula
$$f' = f\,\frac{V - v_O}{V - v_S}$$
with **all velocities taken positive in the direction from source to observer** ($V$ = speed of sound). Equivalent memory rule: numerator (observer) — *toward* means $+v_O$; denominator (source) — *toward* means $-v_S$. Either way: **approach → higher $f'$, recede → lower**.

## Why two different mechanisms
:::fig doppler

- **Source moving** at $v_S$: in one period it moves $v_S T$, so the wavelength ahead is $\lambda' = (V - v_S)T = \dfrac{V - v_S}{f}$. The observer receives $f' = V/\lambda' = f\dfrac{V}{V - v_S}$. The wavelength really changes.
- **Observer moving** at $v_O$ toward the source: the waves still have $\lambda = V/f$, but they arrive at relative speed $V + v_O$: $f' = \dfrac{V + v_O}{\lambda} = f\dfrac{V + v_O}{V}$. The wavelength does not change.

## Common set-ups
1. Source passes a stationary observer: heard frequency drops from $f\frac{V}{V-v_S}$ to $f\frac{V}{V+v_S}$. Ratio $\dfrac{f_2}{f_1} = \dfrac{V - v_S}{V + v_S}$ (exam favourite).
2. Reflection from a wall: the wall is first an observer (receives $f_1$), then a source re-emitting $f_1$. Apply the formula twice. Beats between direct and reflected sound: $|f_{direct} - f_{reflected}|$.
3. Wind: sound speed becomes $V \pm w$ in the formula (the medium moves; the ratio logic is unchanged).
4. Motion at an angle: use only the velocity **component along the line** joining source and observer.

## Light
Same idea for light (redshift of receding galaxies), but the formula differs at high speed; the EJU only asks the qualitative direction.`,
      ja: r`## 1つの式
$$f' = f\,\frac{V - v_O}{V - v_S}$$
**すべての速度を「音源から観測者へ向かう向き」を正にとる**（$V$ = 音速）。覚え方：分子（観測者）— 近づくなら $+v_O$、分母（音源）— 近づくなら $-v_S$。どちらにせよ **近づく → $f'$ 高い、遠ざかる → 低い**。

## なぜ2つの仕組みか
:::fig doppler

- **音源が動く**（$v_S$）：1周期の間に $v_S T$ 進むので、前方の波長は $\lambda' = (V - v_S)T = \dfrac{V - v_S}{f}$。観測者が受け取るのは $f' = V/\lambda' = f\dfrac{V}{V - v_S}$。波長が実際に変わる。
- **観測者が動く**（$v_O$、音源へ）：波の $\lambda = V/f$ はそのままだが、相対速度 $V + v_O$ でやってくる：$f' = \dfrac{V + v_O}{\lambda} = f\dfrac{V + v_O}{V}$。波長は変わらない。

## よくある設定
1. 音源が静止した観測者を通り過ぎる：聞こえる振動数は $f\frac{V}{V-v_S}$ から $f\frac{V}{V+v_S}$ へ下がる。比 $\dfrac{f_2}{f_1} = \dfrac{V - v_S}{V + v_S}$（頻出）。
2. 壁での反射：壁はまず観測者（$f_1$ を受け取る）、次に $f_1$ を出す音源。式を2回使う。直接音と反射音のうなり：$|f_{直接} - f_{反射}|$。
3. 風：式の音速を $V \pm w$ にする（媒質が動く。比の考え方は同じ）。
4. 斜めの運動：音源と観測者を結ぶ**直線方向の速度成分**だけを使う。

## 光
光でも同じ考え（遠ざかる銀河の赤方偏移）だが高速では式が違う。EJUは向きの定性的な理解だけを問う。`,
    },
    exam: {
      en: ['Source moving between two observers (ahead hears $f_1$, behind hears $f_2$): express $f_2/f_1$ or find $v_S$ (block III, almost every year).', 'Both source and observer moving: which formula signs; the frequency heard.', 'Sound reflected from a moving wall / car: frequency of the echo, or the beat frequency.'],
      ja: ['2人の観測者の間を動く音源（前方が $f_1$、後方が $f_2$）：$f_2/f_1$ を表す、または $v_S$ を求める（大問 III、ほぼ毎年）。', '音源と観測者の両方が動く：符号の選び方、聞こえる振動数。', '動く壁・車で反射した音：反射音の振動数、うなりの振動数。'],
    },
    traps: {
      en: ['The speed of sound $V$ is a property of the air — it does **not** add to the source speed.', 'A moving source changes $\\lambda$; a moving observer does not. Questions ask "which wavelength does the observer measure?" to test exactly this.', 'When the source moves perpendicular to the line of sight (closest approach), there is momentarily **no** Doppler shift.'],
      ja: ['音速 $V$ は空気の性質で、音源の速さは**足されない**。', '動く音源は $\\lambda$ を変えるが、動く観測者は変えない。「観測者が測る波長は？」はまさにこれを試す。', '音源が視線に垂直に動く瞬間（最接近点）はドップラー効果が**ない**。'],
    },
    followups: {
      en: ['Derive λ′ = (V − v_S)/f for a moving source with a picture in words.', 'Why does a moving observer not change the wavelength?', 'Solve the reflecting-wall problem with numbers step by step.', 'How do I handle the case where the source moves at an angle?'],
      ja: ['動く音源の λ′ = (V − v_S)/f を言葉の絵で導いて。', '動く観測者では波長が変わらないのはなぜ？', '壁で反射する問題を数値で順に解いて。', '音源が斜めに動く場合はどう扱う？'],
    },
  },
  {
    id: 'light',
    core: {
      en: 'Light slows down in denser media (n = c/v), and slowing at an angled boundary bends the ray: n₁ sin θ₁ = n₂ sin θ₂. Going from slow to fast, the refracted angle can reach 90° — beyond that critical angle everything reflects. Lenses and mirrors are just refraction/reflection organised so rays from one point meet again at another: 1/a + 1/b = 1/f.',
      ja: '光は密な媒質で遅くなり（n = c/v）、境界に斜めに入ると遅くなる分だけ曲がる：n₁ sin θ₁ = n₂ sin θ₂。遅い媒質から速い媒質へ出るとき屈折角は 90° に達しうる — その臨界角を超えると全部反射する。レンズや鏡は、1点から出た光が別の1点に集まるように屈折・反射を整えたもの：1/a + 1/b = 1/f。',
    },
    body: {
      en: r`## Refractive index and Snell's law
:::fig refraction

$n = \dfrac{c}{v}$ (≥ 1). In a medium, **frequency stays, wavelength shrinks**: $\lambda_n = \lambda/n$.
$$n_1\sin\theta_1 = n_2\sin\theta_2$$
Angles are measured from the **normal**. Into a denser medium → toward the normal. Through several parallel layers, $n\sin\theta$ is the same in every layer — you can skip the middle ones.

## Total internal reflection
Only from dense to less dense ($n_1 > n_2$). Critical angle: $\sin\theta_c = n_2/n_1$ ($= 1/n$ into air). Beyond $\theta_c$ nothing is transmitted. Optical fibres, diamond sparkle, the mirror-like water surface seen from below.

## Dispersion, scattering, polarisation
- Dispersion: $n$ depends on colour — violet bends more than red (prism, rainbow).
- Scattering: short wavelengths scatter most → blue sky, red sunset.
- Polarisation: light is a transverse wave; a polariser passes one oscillation direction. Sound cannot be polarised (longitudinal).

## Lenses
:::fig lens

$$\frac1a + \frac1b = \frac1f, \qquad m = \left|\frac{b}{a}\right|$$
Sign convention: $a$ = object distance (positive in front). $b > 0$ → real image (other side, inverted, can be projected); $b < 0$ → virtual image (same side, upright). $f > 0$ convex (converging), $f < 0$ concave (diverging, always virtual, smaller).

| convex lens, object at | image |
|---|---|
| beyond $2f$ | real, inverted, smaller, between $f$ and $2f$ |
| at $2f$ | real, inverted, same size, at $2f$ |
| between $f$ and $2f$ | real, inverted, larger, beyond $2f$ |
| at $f$ | no image (parallel rays) |
| inside $f$ | virtual, upright, larger (magnifying glass) |

Three ray-drawing rules: (1) parallel ray → through far focus; (2) ray through the centre → straight; (3) ray through near focus → parallel.

## Spherical mirrors
Same formula with $f = R/2$. Concave mirror behaves like a convex lens (real images for $a > f$); convex mirror like a concave lens (always virtual, smaller, upright — car wing mirrors).`,
      ja: r`## 屈折率とスネルの法則
:::fig refraction

$n = \dfrac{c}{v}$（≥ 1）。媒質中では**振動数は同じ、波長は縮む**：$\lambda_n = \lambda/n$。
$$n_1\sin\theta_1 = n_2\sin\theta_2$$
角度は**法線**から測る。密な媒質へ → 法線に近づく。平行な層を何枚も通るとき、$n\sin\theta$ はどの層でも同じ — 途中の層は飛ばせる。

## 全反射
密な媒質から疎な媒質へのときだけ（$n_1 > n_2$）。臨界角：$\sin\theta_c = n_2/n_1$（空気へなら $= 1/n$）。$\theta_c$ を超えると何も透過しない。光ファイバー、ダイヤモンドの輝き、水中から見た鏡のような水面。

## 分散・散乱・偏光
- 分散：$n$ は色で異なる — 紫が赤より大きく曲がる（プリズム、虹）。
- 散乱：短い波長ほど散乱される → 青い空、赤い夕日。
- 偏光：光は横波。偏光板は1方向の振動だけ通す。音は偏光しない（縦波）。

## レンズ
:::fig lens

$$\frac1a + \frac1b = \frac1f, \qquad m = \left|\frac{b}{a}\right|$$
符号：$a$ = 物体までの距離（前方を正）。$b > 0$ → 実像（反対側、倒立、スクリーンに映る）。$b < 0$ → 虚像（同じ側、正立）。$f > 0$ 凸レンズ（収束）、$f < 0$ 凹レンズ（発散、常に虚像で小さい）。

| 凸レンズ、物体の位置 | 像 |
|---|---|
| $2f$ より遠い | 実像、倒立、縮小、$f$ と $2f$ の間 |
| $2f$ | 実像、倒立、等倍、$2f$ |
| $f$ と $2f$ の間 | 実像、倒立、拡大、$2f$ より遠い |
| $f$ | 像なし（平行光） |
| $f$ より内側 | 虚像、正立、拡大（虫めがね） |

作図の3本：(1) 光軸に平行 → 反対側の焦点を通る、(2) 中心を通る → 直進、(3) 手前の焦点を通る → 平行。

## 球面鏡
同じ式で $f = R/2$。凹面鏡は凸レンズと同様（$a > f$ で実像）、凸面鏡は凹レンズと同様（常に虚像・縮小・正立 — 車のサイドミラー）。`,
    },
    exam: {
      en: ['Ray through air–glass–water (given $n$ values): $\\sin$ of the final angle, or the critical angle at an interface (block III, most years).', 'Convex lens: object at distance $a$, find image position and magnification; or where to put a screen.', 'Which statement about dispersion / total reflection / polarisation is correct.'],
      ja: ['空気–ガラス–水（$n$ が与えられる）を通る光線：最後の角の $\\sin$、境界面での臨界角（大問 III、ほぼ毎年）。', '凸レンズ：距離 $a$ の物体の像の位置と倍率、スクリーンを置く位置。', '分散・全反射・偏光についての正しい記述はどれか。'],
    },
    traps: {
      en: ['Angles in Snell\'s law are from the normal, not from the surface.', 'Total internal reflection needs the light to be going **from the denser** medium; air → glass never totally reflects.', 'A virtual image cannot be caught on a screen but **can** be seen and photographed.'],
      ja: ['スネルの法則の角度は法線から測る。面からではない。', '全反射は光が**密な媒質から**出るときだけ。空気 → ガラスでは起こらない。', '虚像はスクリーンには映らないが、目で見たり写真に撮ったりは**できる**。'],
    },
    followups: {
      en: ['Why does light bend toward the normal when it slows down?', 'Show me the layered-media trick where n sin θ is constant.', 'Derive the lens formula from the ray diagram (similar triangles).', 'Why is the sky blue and the sunset red?'],
      ja: ['光は遅くなるとなぜ法線側へ曲がるの？', 'n sin θ が一定になる多層媒質のコツを見せて。', '作図（相似な三角形）からレンズの式を導いて。', '空が青く夕日が赤いのはなぜ？'],
    },
  },
  {
    id: 'light-interference',
    core: {
      en: 'Light interferes just like any wave: two paths meeting with a path difference of mλ add up bright, (m + ½)λ cancel dark. Every interference set-up (double slit, grating, thin film, air wedge) is the same question — write the path difference, and remember that reflection off a denser medium adds half a wavelength.',
      ja: '光も他の波と同じく干渉する：2つの経路が出会うとき経路差が mλ なら明るく、(m + ½)λ なら暗い。どの干渉装置（複スリット、回折格子、薄膜、くさび）も同じ問題 — 経路差を書く。密な媒質での反射は半波長分ずれることを忘れずに。',
    },
    body: {
      en: r`## Young's double slit
:::fig young

Slit spacing $d$, screen distance $L \gg d$: path difference to a point at height $x$ is $\approx \dfrac{dx}{L}$.
- Bright: $\dfrac{dx}{L} = m\lambda$ → fringe spacing $\Delta x = \dfrac{L\lambda}{d}$.
- Dark: $\dfrac{dx}{L} = (m + \tfrac12)\lambda$.
Longer $\lambda$ (red) → wider fringes; closer slits → wider fringes; in water ($\lambda/n$) → narrower. Cover one slit → no fringes, just single-slit diffraction. Put a thin plate over one slit → the whole pattern shifts toward that slit.

## Diffraction grating
$N$ slits per metre → spacing $d = 1/N$. Bright directions: $d\sin\theta = m\lambda$. Many slits make the bright lines very sharp; white light spreads into spectra (red at larger angle).

## Thin films (the half-wavelength rule)
:::fig thin-film

Reflection at a boundary **from low $n$ to high $n$** flips the phase (like a fixed end) — equivalent to an extra $\lambda/2$ of path. From high to low $n$: no flip.
Film of thickness $d$ and index $n$ in air, near-normal incidence: the two reflected rays have optical path difference $2nd$ **plus** one phase flip (top surface only).
- Bright (reflected): $2nd = (m + \tfrac12)\lambda$
- Dark (reflected): $2nd = m\lambda$
(Transmitted light is the complement.) Soap bubbles look black where thinnest; oil films show colours because $d$ and $\lambda$ vary.

## Air wedge (two glass plates)
Gap thickness $d$ at a point; reflections from the bottom of the top plate (glass→air, no flip) and the top of the bottom plate (air→glass, flip). Path difference $2d$, one flip:
- Dark: $2d = m\lambda$ (including $d = 0$ at the contact line — **the edge is dark**).
- Fringe spacing $= \dfrac{\lambda}{2\tan\alpha} \approx \dfrac{\lambda}{2\alpha}$. Filling the wedge with water ($n$) shrinks $\lambda$ → fringes get closer by $1/n$.

## Newton's rings
Same physics with a curved lens on a plate: dark centre, rings get closer outward.`,
      ja: r`## ヤングの実験
:::fig young

スリット間隔 $d$、スクリーンまで $L \gg d$：高さ $x$ の点までの経路差は $\approx \dfrac{dx}{L}$。
- 明線：$\dfrac{dx}{L} = m\lambda$ → 明線の間隔 $\Delta x = \dfrac{L\lambda}{d}$。
- 暗線：$\dfrac{dx}{L} = (m + \tfrac12)\lambda$。
$\lambda$ が長い（赤）→ 間隔が広い。スリットが近い → 広い。水中（$\lambda/n$）→ 狭い。片方のスリットを覆う → 縞は消え単スリットの回折だけ。片方に薄い板 → 縞全体がその側へずれる。

## 回折格子
1 m あたり $N$ 本 → 間隔 $d = 1/N$。明るい方向：$d\sin\theta = m\lambda$。スリットが多いので明線が非常に鋭い。白色光はスペクトルに分かれる（赤が大きい角）。

## 薄膜（半波長のルール）
:::fig thin-film

**$n$ が小さい側から大きい側への**境界での反射は位相が反転（固定端と同じ）— 経路差 $\lambda/2$ 分に相当。大 → 小では反転なし。
空気中の厚さ $d$、屈折率 $n$ の膜、ほぼ垂直入射：2つの反射光の光路差は $2nd$、**加えて**上面での反転1回。
- 明（反射光）：$2nd = (m + \tfrac12)\lambda$
- 暗（反射光）：$2nd = m\lambda$
（透過光はその逆。）シャボン玉は最も薄いところが黒く見える。油膜が色づくのは $d$ と $\lambda$ が変わるから。

## くさび形空気層（2枚のガラス板）
ある点での空気層の厚さ $d$。上の板の下面（ガラス→空気、反転なし）と下の板の上面（空気→ガラス、反転）で反射。経路差 $2d$、反転1回：
- 暗線：$2d = m\lambda$（接している端 $d = 0$ も含む — **端は暗い**）。
- 縞の間隔 $= \dfrac{\lambda}{2\tan\alpha} \approx \dfrac{\lambda}{2\alpha}$。すき間を水（$n$）で満たすと $\lambda$ が縮み → 間隔は $1/n$ 倍。

## ニュートンリング
平面板の上に曲面レンズをのせた同じ物理：中心が暗く、外側ほど輪が密になる。`,
    },
    exam: {
      en: ['Double slit: fringe spacing when $\\lambda$, $d$, $L$ or the medium changes; what happens if one slit is covered or a plate is inserted.', 'Thin film / air wedge: condition for dark reflection, number of fringes, spacing change when filled with liquid (block III, frequent).', 'Grating: angle of the $m$-th order line, or the maximum order visible ($\\sin\\theta \\le 1$).'],
      ja: ['複スリット：$\\lambda$、$d$、$L$、媒質が変わったときの縞の間隔。片方を覆う・板を入れるとどうなるか。', '薄膜・くさび：反射光が暗くなる条件、縞の本数、液体で満たしたときの間隔の変化（大問 III、頻出）。', '回折格子：$m$ 次の明線の角度、見える最大次数（$\\sin\\theta \\le 1$）。'],
    },
    traps: {
      en: ['Count phase flips: one flip → the bright/dark conditions swap compared with the "no flip" case. Two flips (film on glass with $n_{film} < n_{glass}$) → they swap back.', 'Inside a film use the wavelength **in the film**, $\\lambda/n$; that is where the $2nd$ comes from.', 'The contact edge of an air wedge is **dark**, not bright.'],
      ja: ['位相反転の回数を数える：1回 → 「反転なし」の場合と明暗の条件が入れかわる。2回（$n_{膜} < n_{ガラス}$ のガラス上の膜）→ 元に戻る。', '膜の中では**膜中の**波長 $\\lambda/n$ を使う。$2nd$ はそこから来る。', 'くさびの接触端は明ではなく**暗**。'],
    },
    followups: {
      en: ['Why does reflection off a denser medium add half a wavelength?', 'Derive Δx = Lλ/d for the double slit.', 'Do the soap-film problem: why is the thinnest part black?', 'What happens to air-wedge fringes when the wedge angle is doubled?'],
      ja: ['密な媒質での反射で半波長ずれるのはなぜ？', '複スリットの Δx = Lλ/d を導いて。', 'シャボン膜の問題：最も薄い部分が黒いのはなぜ？', 'くさびの角度を2倍にすると縞はどうなる？'],
    },
  },
  // ───────────────────────────── ELECTROMAGNETISM ─────────────────────────────
  {
    id: 'electric-field',
    core: {
      en: 'Charges push and pull with F = kq₁q₂/r². The electric field E is "force per unit positive charge" — a map of what a test charge would feel at each point. Fields from several charges simply add as vectors, and the field lines show their direction: out of +, into −.',
      ja: '電荷は F = kq₁q₂/r² で押し合い・引き合う。電場 E は「単位正電荷あたりの力」— 各点に置いた試験電荷が感じる力の地図。複数の電荷の電場はベクトルとして足すだけ。電気力線は向きを示す：＋から出て −に入る。',
    },
    body: {
      en: r`## Coulomb's law
$$F = k\frac{q_1 q_2}{r^2}, \qquad k = \frac{1}{4\pi\varepsilon_0} = 9.0\times10^9\ \mathrm{N\,m^2/C^2}$$
Like charges repel, unlike attract; the force acts along the line joining them and obeys the third law. Compare with gravity: same $1/r^2$ shape, but electric force can be repulsive and is enormously stronger.

## Electric field
$$\vec E = \frac{\vec F}{q} \quad(\text{N/C = V/m}), \qquad E_{point\ charge} = k\frac{Q}{r^2}$$
- $E$ points **away** from a positive charge, **toward** a negative one.
- A charge $q$ in a field feels $\vec F = q\vec E$ — a negative charge is pushed opposite to $\vec E$.
- **Superposition**: $\vec E$ at a point = vector sum of the fields of all charges. Draw each arrow, then add components.

:::fig field-lines

## Field lines
- Start on +, end on −, never cross.
- Denser lines = stronger field.
- Perpendicular to a conductor's surface; zero inside a conductor (electrostatics).
- Uniform field between parallel plates: evenly spaced parallel lines.

## Typical geometry questions
- **Midpoint between $+Q$ and $+Q$**: fields cancel, $E = 0$. Between $+Q$ and $-Q$: fields add.
- **Where is $E = 0$ on the axis of $+4q$ and $+q$?** Between them, closer to the smaller charge: $k\frac{4q}{x^2} = k\frac{q}{(d-x)^2}$ → $x = 2d/3$.
- **Charges at the corners of a square**: find the force on one corner from the other three, using symmetry for the two adjacent ones ($\sqrt2$ factor for the resultant) and $1/(\sqrt2 a)^2$ for the diagonal one.

## Gauss's law (qualitative)
Total number of field lines leaving a closed surface ∝ enclosed charge ($4\pi k Q$ lines per charge $Q$). It explains why $E$ inside a hollow charged sphere is zero and why the field of a charged plate is uniform.`,
      ja: r`## クーロンの法則
$$F = k\frac{q_1 q_2}{r^2}, \qquad k = \frac{1}{4\pi\varepsilon_0} = 9.0\times10^9\ \mathrm{N\,m^2/C^2}$$
同符号は反発、異符号は引き合う。力は2つを結ぶ直線上で、作用・反作用が成り立つ。重力との比較：同じ $1/r^2$ の形だが、電気力は反発もあり、はるかに強い。

## 電場
$$\vec E = \frac{\vec F}{q} \quad(\text{N/C = V/m}), \qquad E_{点電荷} = k\frac{Q}{r^2}$$
- $E$ は正電荷から**遠ざかる**向き、負電荷に**向かう**向き。
- 電場中の電荷 $q$ は $\vec F = q\vec E$ を受ける — 負電荷は $\vec E$ と逆向きに押される。
- **重ね合わせ**：ある点の $\vec E$ = すべての電荷の電場のベクトル和。矢印を1本ずつ描いてから成分で足す。

:::fig field-lines

## 電気力線
- ＋から出て −に入る。交わらない。
- 密なほど電場が強い。
- 導体表面に垂直。導体内部は0（静電気）。
- 平行板間の一様な電場：等間隔の平行線。

## 典型的な配置の問題
- **$+Q$ と $+Q$ の中点**：電場は打ち消し合い $E = 0$。$+Q$ と $-Q$ の間：足し合う。
- **$+4q$ と $+q$ を結ぶ線上で $E = 0$ になる点は？** 2つの間で小さい電荷寄り：$k\frac{4q}{x^2} = k\frac{q}{(d-x)^2}$ → $x = 2d/3$。
- **正方形の頂点の電荷**：1つの頂点が他の3つから受ける力。隣の2つは対称性で合力 $\sqrt2$ 倍、対角のものは $1/(\sqrt2 a)^2$。

## ガウスの法則（定性的）
閉曲面から出る電気力線の本数 ∝ 内部の電荷（電荷 $Q$ あたり $4\pi k Q$ 本）。帯電した中空球の内部で $E$ が0になること、帯電板の電場が一様なことの説明になる。`,
    },
    exam: {
      en: ['Charges at corners of a square (or on a line): the charge $Q$ at the centre that makes the net force on a corner charge zero, or the field/potential at the centre (block IV, most years).', 'Point where the field is zero between two unequal charges.', 'Sketch/choose the field-line pattern for two charges.'],
      ja: ['正方形の頂点（または直線上）の電荷：頂点の電荷にはたらく合力を0にする中心の電荷 $Q$、中心での電場・電位（大問 IV、ほぼ毎年）。', '大きさの違う2電荷の間で電場が0になる点。', '2電荷の電気力線のパターンを描く・選ぶ。'],
    },
    traps: {
      en: ['$E$ is defined by a **positive** test charge; the force on an electron is opposite to $E$.', 'Fields add as **vectors** — equal fields at 90° give $\\sqrt2 E$, not $2E$.', 'The field at the midpoint of two equal like charges is zero, but the **potential** is not.'],
      ja: ['$E$ は**正の**試験電荷で定義。電子にはたらく力は $E$ と逆向き。', '電場は**ベクトル**として足す — 90° の等しい電場は $2E$ ではなく $\\sqrt2 E$。', '等しい同符号の2電荷の中点で電場は0だが、**電位**は0ではない。'],
    },
    followups: {
      en: ['Explain the difference between force and field with a concrete example.', 'Show the square-corner problem: net force on one charge from the other three.', 'Why is the electric field zero inside a conductor?', 'How do I find where E = 0 between +4q and +q?'],
      ja: ['力と電場の違いを具体例で説明して。', '正方形の頂点の問題：1つの電荷が他の3つから受ける合力を見せて。', '導体の内部で電場が0になるのはなぜ？', '+4q と +q の間で E = 0 になる点はどう求める？'],
    },
  },
  {
    id: 'electric-potential',
    core: {
      en: 'Potential is electric potential energy per unit charge: V = U/q, a number (not a vector) at each point. A charge slides "downhill" in potential, and the field is the slope: E = −ΔV/Δx. In a uniform field, V = Ed; from a point charge, V = kQ/r (potentials from several charges just add as numbers).',
      ja: '電位は単位電荷あたりの電気的位置エネルギー：V = U/q。各点の数（ベクトルではない）。電荷は電位の「坂を下る」ように動き、電場はその傾き：E = −ΔV/Δx。一様な電場では V = Ed、点電荷では V = kQ/r（複数の電荷の電位は数として足すだけ）。',
    },
    body: {
      en: r`## Definitions
- Potential energy of $q$ at a point: $U = qV$.
- Potential difference $V_{AB} = V_A - V_B$ = work per unit charge to move from B to A. Unit: volt = J/C.
- Work done **by the field** moving $q$ from A to B: $W = q(V_A - V_B)$. Positive charges gain kinetic energy when falling to lower $V$; electrons gain energy moving to **higher** $V$.

## Uniform field (parallel plates)
$$E = \frac{V}{d}$$ — field = voltage per metre. Equipotential surfaces are planes parallel to the plates. Moving along an equipotential costs no work; $E$ is always perpendicular to equipotentials.

## Point charge
$$V = k\frac{Q}{r}$$ (zero at infinity, sign of $Q$ included). Potential energy of two charges: $U = k\dfrac{q_1q_2}{r}$ — positive for like charges (they want to fly apart).
For several charges, $V = \sum kQ_i/r_i$ — **scalar** addition, no angles. The potential at the centre of a square with $+Q$ at all four corners is $4kQ/(a/\sqrt2)$; the field there is zero.

## Energy method for particles
Charge $q$ accelerated through $V$: $\tfrac12 mv^2 = qV$. An electron through 1 V gains 1 eV $= 1.6\times10^{-19}$ J. This replaces any force-and-acceleration calculation.

## Reading V–x graphs
$E = -\dfrac{dV}{dx}$: the field points **down the potential hill**, and its size is the slope. Flat $V$ ⇒ $E = 0$ (inside a conductor). The EJU gives $V(x)$ and asks for the direction and magnitude of $E$, or for the work to move a charge between two $x$ values ($W = q\Delta V$, path-independent).`,
      ja: r`## 定義
- 電荷 $q$ の位置エネルギー：$U = qV$。
- 電位差 $V_{AB} = V_A - V_B$ = B から A へ単位電荷を運ぶ仕事。単位 ボルト = J/C。
- $q$ を A から B へ動かすとき**電場が**する仕事：$W = q(V_A - V_B)$。正電荷は低い $V$ へ「落ちる」と運動エネルギーを得る。電子は**高い** $V$ へ動くとエネルギーを得る。

## 一様な電場（平行板）
$$E = \frac{V}{d}$$ — 電場 = 1 m あたりの電圧。等電位面は極板に平行な面。等電位面に沿って動かす仕事は0。$E$ は常に等電位面に垂直。

## 点電荷
$$V = k\frac{Q}{r}$$（無限遠で0、$Q$ の符号を含む）。2電荷の位置エネルギー：$U = k\dfrac{q_1q_2}{r}$ — 同符号なら正（離れたがる）。
複数の電荷では $V = \sum kQ_i/r_i$ — **スカラー**の和、角度なし。4頂点に $+Q$ の正方形の中心の電位は $4kQ/(a/\sqrt2)$、電場は0。

## 粒子のエネルギー法
電圧 $V$ で加速された電荷 $q$：$\tfrac12 mv^2 = qV$。電子が 1 V で得るのは 1 eV $= 1.6\times10^{-19}$ J。力と加速度の計算はすべてこれで置きかえられる。

## V–x グラフの読み方
$E = -\dfrac{dV}{dx}$：電場は**電位の坂を下る向き**、大きさは傾き。$V$ が平ら ⇒ $E = 0$（導体内部）。EJUは $V(x)$ を与えて $E$ の向きと大きさ、あるいは2つの $x$ の間で電荷を動かす仕事（$W = q\Delta V$、経路によらない）を問う。`,
    },
    exam: {
      en: ['Potential at the centre of a charge arrangement (scalar sum) vs field there (vector sum, often zero).', 'Work to move a charge between two points in a uniform field or near a point charge; kinetic energy gained.', 'Given a $V$–$x$ graph, find $E$ (slope) and its direction, or where a released charge speeds up.'],
      ja: ['電荷配置の中心での電位（スカラー和）と電場（ベクトル和、しばしば0）。', '一様な電場や点電荷のそばで電荷を動かす仕事、得る運動エネルギー。', '$V$–$x$ グラフから $E$（傾き）と向き、放した電荷が加速する向き。'],
    },
    traps: {
      en: ['Potential is a scalar: signs matter, directions do not. $+Q$ and $-Q$ give zero potential at their midpoint (but not zero field).', '$E = V/d$ only in a **uniform** field; do not use it for point charges.', 'A negative charge moves toward **higher** potential; its potential energy $qV$ still decreases.'],
      ja: ['電位はスカラー：符号は重要、向きは不要。$+Q$ と $-Q$ の中点の電位は0（電場は0ではない）。', '$E = V/d$ は**一様な**電場だけ。点電荷には使わない。', '負電荷は**高い**電位へ動く。その位置エネルギー $qV$ はやはり減る。'],
    },
    followups: {
      en: ['Why is potential a scalar while field is a vector?', 'Show how E = V/d comes from the definition of potential.', 'Explain the V–x graph → E rule with a sketch in words.', 'Do an electron-accelerated-through-V problem with numbers.'],
      ja: ['電位がスカラーで電場がベクトルなのはなぜ？', 'E = V/d が電位の定義からどう出るか見せて。', 'V–x グラフ → E のルールを言葉の絵で説明して。', '電圧 V で加速された電子の問題を数値で解いて。'],
    },
  },
  {
    id: 'conductors-dielectrics',
    core: {
      en: 'A conductor has free charges that move until the field inside is zero and the whole conductor sits at one potential; an insulator has no free charges, so its molecules only stretch (polarise) and weaken the field inside. Both effects are why a charged rod attracts neutral objects.',
      ja: '導体には自由に動く電荷があり、内部の電場が0になり導体全体が同じ電位になるまで動く。絶縁体には自由な電荷がないので分子が伸びる（分極する）だけで、内部の電場を弱める。どちらも帯電した棒が中性の物体を引きつける理由。',
    },
    body: {
      en: r`## Conductor in an electric field (electrostatic induction)
Free electrons move against the field until the **internal field is zero**. Consequences:
1. $E = 0$ inside; the surface has induced charges (− on the side facing a + rod, + on the far side).
2. The conductor is an **equipotential**; $E$ at the surface is perpendicular to it.
3. Excess charge sits on the outer surface only; it concentrates at sharp points.
4. **Electrostatic shielding**: a hollow conductor keeps its interior field-free whatever happens outside (car in lightning, metal-cased instruments).
5. **Grounding** (earthing): connecting to Earth lets charge flow so the conductor is at potential 0. Ground a body while a + rod is nearby, then remove the wire, then the rod → the body keeps a **negative** charge (induction charging).

## Insulator (dielectric) in a field: dielectric polarisation
No free charges. Each molecule stretches into a tiny dipole (or the existing dipoles align). Bound charges appear on the surfaces, producing an internal field that **opposes** the external one → the field inside is reduced to $E/\varepsilon_r$ but is **not zero**. This is why a dielectric in a capacitor raises its capacitance (see Capacitors).

| | conductor | dielectric |
|---|---|---|
| charges | free electrons move | bound charges shift slightly |
| inside field | 0 | reduced ($E_0/\varepsilon_r$) |
| surface charge | induced (real, can be separated) | polarisation charge (cannot be separated) |
| attracted by a charged rod? | yes | yes (weaker) |

## Why a charged rod picks up paper
Polarisation puts the opposite charge slightly **closer** to the rod than the like charge, so the attraction (∝ $1/r^2$) wins over the repulsion. Net force is attractive for both signs of rod charge.

## Electroscope logic
Leaves diverge when they carry like charge. Bring a + rod near: electrons rush up to the cap, leaves become more + → open wider if the scope was +, close (then reopen) if it was −. Use this to determine an unknown sign.`,
      ja: r`## 電場中の導体（静電誘導）
自由電子は**内部の電場が0**になるまで電場と逆向きに動く。結果：
1. 内部で $E = 0$。表面に誘導電荷（＋の棒に面した側に −、反対側に ＋）。
2. 導体は**等電位**。表面の $E$ は表面に垂直。
3. 余分な電荷は外側の表面だけにあり、とがった所に集まる。
4. **静電遮蔽**：中空の導体は外で何が起きても内部を無電場に保つ（雷の中の車、金属ケースの計器）。
5. **接地（アース）**：地球とつなぐと電荷が流れて導体の電位が0になる。＋の棒を近づけたまま接地し、線を外し、それから棒を離す → 物体には**負**の電荷が残る（誘導帯電）。

## 電場中の絶縁体（誘電体）：誘電分極
自由な電荷がない。各分子が小さな双極子に伸びる（またはもともとの双極子がそろう）。表面に分極電荷が現れ、外部電場と**逆向き**の内部電場をつくる → 内部の電場は $E/\varepsilon_r$ に減るが**0ではない**。コンデンサーに誘電体を入れると電気容量が増える理由（コンデンサー参照）。

| | 導体 | 誘電体 |
|---|---|---|
| 電荷 | 自由電子が動く | 束縛電荷がわずかにずれる |
| 内部の電場 | 0 | 減る（$E_0/\varepsilon_r$） |
| 表面の電荷 | 誘導電荷（実際に分離できる） | 分極電荷（分離できない） |
| 帯電した棒に引かれる？ | 引かれる | 引かれる（弱い） |

## 帯電した棒が紙を引きつける理由
分極で異符号の電荷が同符号の電荷より棒に少し**近く**なるので、引力（∝ $1/r^2$）が斥力に勝つ。棒の電荷の符号によらず正味は引力。

## 箔検電器の考え方
箔は同符号の電荷をもつと開く。＋の棒を近づける：電子が上の金属板へ集まり、箔はより ＋ に → 検電器が ＋ なら大きく開き、− なら閉じてから再び開く。これで未知の符号を判定する。`,
    },
    exam: {
      en: ['A charged rod near a grounded/isolated metal sphere: sign and location of induced charge; what remains after the sequence "ground → remove wire → remove rod".', 'Compare a conductor and a dielectric slab placed in a uniform field: the field inside each.', 'Electroscope: how the leaves move when a rod approaches or when the cap is touched.'],
      ja: ['接地した／孤立した金属球に帯電した棒を近づける：誘導電荷の符号と位置、「接地 → 線を外す → 棒を離す」の後に残る電荷。', '一様な電場に置いた導体板と誘電体板の比較：内部の電場。', '箔検電器：棒を近づけたとき、金属板に触れたときの箔の動き。'],
    },
    traps: {
      en: ['Inside a **conductor** the field is exactly zero; inside a **dielectric** it is only reduced.', 'In induction charging the body ends up with the **opposite** sign to the rod; by contact charging it gets the **same** sign.', 'Shielding blocks external fields from entering; charges **inside** a hollow conductor do produce a field outside.'],
      ja: ['**導体**内部の電場はちょうど0。**誘電体**内部では減るだけ。', '誘導帯電では物体は棒と**逆**符号になる。接触帯電では**同**符号。', '静電遮蔽は外部の電場が中に入るのを防ぐ。中空導体の**内側**の電荷は外に電場をつくる。'],
    },
    followups: {
      en: ['Walk through induction charging step by step and explain the final sign.', 'Why is the field inside a conductor zero but not inside a dielectric?', 'Why does a charged balloon stick to a neutral wall?', 'Explain electrostatic shielding with a Faraday cage example.'],
      ja: ['誘導帯電を順を追って説明し、最後の符号の理由を教えて。', '導体内部の電場は0なのに誘電体内部は0でないのはなぜ？', '帯電した風船が中性の壁にくっつくのはなぜ？', 'ファラデーケージの例で静電遮蔽を説明して。'],
    },
  },
  {
    id: 'capacitors',
    core: {
      en: 'A capacitor stores charge Q = CV on two plates; C = ε₀S/d grows with plate area, shrinks with gap, and multiplies by εᵣ with a dielectric. Energy stored is ½CV² = Q²/2C. Two rules decide every circuit question: charge is conserved on isolated plates, and the battery fixes the voltage while connected.',
      ja: 'コンデンサーは2枚の極板に電荷 Q = CV を蓄える。C = ε₀S/d は面積で増え、間隔で減り、誘電体で εᵣ 倍になる。蓄えるエネルギーは ½CV² = Q²/2C。回路の問題は2つのルールで決まる：孤立した極板の電荷は保存、電池につながっている間は電圧が固定。',
    },
    body: {
      en: r`## Basics
$$Q = CV, \qquad C = \varepsilon_0\frac{S}{d}\ (\times\varepsilon_r\ \text{with a dielectric}), \qquad U = \tfrac12 CV^2 = \tfrac12 QV = \frac{Q^2}{2C}$$
Unit: farad = C/V. Field between the plates: $E = V/d = Q/(\varepsilon_0 S)$ — note $E$ depends on $Q$ and $S$ only, not on $d$.

## The two situations
| | battery **connected** (V fixed) | battery **disconnected** (Q fixed) |
|---|---|---|
| pull plates apart ($d\uparrow$, $C\downarrow$) | $Q\downarrow$, $E\downarrow$, $U\downarrow$ | $V\uparrow$, $E$ same, $U\uparrow$ (you did work) |
| insert dielectric ($C\uparrow$) | $Q\uparrow$, $U\uparrow$ | $V\downarrow$, $U\downarrow$ (slab is pulled in) |

Ask first: is $V$ fixed or $Q$ fixed? Then read off the row.

:::fig capacitor

## Combinations
- **Parallel** (same $V$): $C = C_1 + C_2$; charges split in proportion to $C$.
- **Series** (same $Q$): $\dfrac1C = \dfrac1{C_1} + \dfrac1{C_2}$; voltages split inversely to $C$.
- A metal slab of thickness $t$ inserted: gap effectively $d - t$. A dielectric slab of thickness $t$: gap $d - t + t/\varepsilon_r$ (series of air and dielectric).

## Charge redistribution and Joule heat (the EJU archetype)
Capacitor $C_1$ charged to $V_0$ is connected (through a resistor) to uncharged $C_2$:
- Charge conserved: $C_1V_0 = (C_1 + C_2)V$ → $V = \dfrac{C_1}{C_1+C_2}V_0$.
- Energy before: $\tfrac12 C_1V_0^2$; after: $\tfrac12(C_1+C_2)V^2$. The difference is **lost as Joule heat in the resistor** (independent of $R$!): $Q_{heat} = \tfrac12\dfrac{C_1C_2}{C_1+C_2}V_0^2$.
If the plates are connected with opposite polarities, the net charge is the difference: $Q_1 - Q_2$.

## Charging through a battery
Charging $C$ from a battery $V$: battery supplies $QV = CV^2$ of energy, capacitor stores $\tfrac12 CV^2$ — the other half is always dissipated, whatever the resistance.

## Charging/discharging curves
Charge rises toward $CV$ and current falls toward 0 with time constant $RC$; a capacitor is an **open circuit** at steady state (no current through it) and a **short circuit** the instant a switch closes (uncharged).`,
      ja: r`## 基本
$$Q = CV, \qquad C = \varepsilon_0\frac{S}{d}\ (\text{誘電体で}\ \times\varepsilon_r), \qquad U = \tfrac12 CV^2 = \tfrac12 QV = \frac{Q^2}{2C}$$
単位 ファラド = C/V。極板間の電場：$E = V/d = Q/(\varepsilon_0 S)$ — $E$ は $Q$ と $S$ だけで決まり $d$ によらないことに注意。

## 2つの状況
| | 電池を**つないだまま**（V 一定） | 電池を**外した**（Q 一定） |
|---|---|---|
| 極板を離す（$d\uparrow$、$C\downarrow$） | $Q\downarrow$、$E\downarrow$、$U\downarrow$ | $V\uparrow$、$E$ 同じ、$U\uparrow$（外から仕事をした） |
| 誘電体を入れる（$C\uparrow$） | $Q\uparrow$、$U\uparrow$ | $V\downarrow$、$U\downarrow$（板は引き込まれる） |

まず「$V$ 一定か $Q$ 一定か」を確認し、行を読む。

:::fig capacitor

## 接続
- **並列**（同じ $V$）：$C = C_1 + C_2$。電荷は $C$ に比例して分かれる。
- **直列**（同じ $Q$）：$\dfrac1C = \dfrac1{C_1} + \dfrac1{C_2}$。電圧は $C$ に反比例して分かれる。
- 厚さ $t$ の金属板を入れる：間隔は実質 $d - t$。厚さ $t$ の誘電体板：間隔 $d - t + t/\varepsilon_r$（空気と誘電体の直列）。

## 電荷の移動とジュール熱（EJUの定番）
$V_0$ に充電した $C_1$ を（抵抗を通して）未充電の $C_2$ につなぐ：
- 電荷保存：$C_1V_0 = (C_1 + C_2)V$ → $V = \dfrac{C_1}{C_1+C_2}V_0$。
- 前のエネルギー：$\tfrac12 C_1V_0^2$、後：$\tfrac12(C_1+C_2)V^2$。差は**抵抗でジュール熱として失われる**（$R$ によらない！）：$Q_{熱} = \tfrac12\dfrac{C_1C_2}{C_1+C_2}V_0^2$。
極性を逆にしてつなぐと正味の電荷は差 $Q_1 - Q_2$。

## 電池で充電するとき
電池 $V$ で $C$ を充電：電池が供給するエネルギーは $QV = CV^2$、コンデンサーに蓄わるのは $\tfrac12 CV^2$ — 残り半分は抵抗の大きさによらず必ず失われる。

## 充放電の曲線
電荷は $CV$ へ、電流は0へ、時定数 $RC$ で近づく。定常状態のコンデンサーは**断線**（電流0）、スイッチを閉じた瞬間（未充電）は**導線**と同じ。`,
    },
    exam: {
      en: ['Charged capacitor connected to another through a resistor: final charges/voltage and the Joule heat (block IV, very frequent).', 'Battery connected vs disconnected: what happens to $Q$, $V$, $E$, $U$ when $d$ changes or a dielectric is inserted.', 'Series/parallel network: equivalent capacitance, charge on each, voltage across each.'],
      ja: ['充電したコンデンサーを抵抗を通して別のコンデンサーにつなぐ：最終的な電荷・電圧とジュール熱（大問 IV、超頻出）。', '電池をつないだまま／外した：$d$ を変える・誘電体を入れると $Q$、$V$、$E$、$U$ はどうなるか。', '直列・並列回路：合成容量、各コンデンサーの電荷と電圧。'],
    },
    traps: {
      en: ['With the battery disconnected $Q$ is fixed — and $E = Q/\\varepsilon_0 S$ does **not** change when you move the plates.', 'Series capacitors share the same **charge**, not the same voltage.', 'Energy lost in redistribution does not depend on $R$; $R$ only changes how long it takes.'],
      ja: ['電池を外すと $Q$ 一定 — 極板を動かしても $E = Q/\\varepsilon_0 S$ は**変わらない**。', '直列のコンデンサーで共通なのは**電荷**であって電圧ではない。', '電荷移動で失われるエネルギーは $R$ によらない。$R$ はかかる時間を変えるだけ。'],
    },
    followups: {
      en: ['Why is exactly half the battery energy lost when charging a capacitor?', 'Solve the C₁→C₂ redistribution problem with numbers, including the heat.', 'Why does inserting a dielectric raise the capacitance?', 'Explain why E between the plates does not depend on d.'],
      ja: ['コンデンサーを充電するとき電池のエネルギーのちょうど半分が失われるのはなぜ？', 'C₁→C₂ の電荷移動の問題を熱まで含めて数値で解いて。', '誘電体を入れると電気容量が増えるのはなぜ？', '極板間の E が d によらない理由を説明して。'],
    },
  },
  {
    id: 'dc-circuits',
    core: {
      en: 'Current is charge flow driven by voltage and limited by resistance: V = IR. Two bookkeeping rules solve any circuit: current in = current out at every junction, and voltages around any closed loop sum to zero. Power is P = IV = I²R = V²/R — choose the form that uses what you know.',
      ja: '電流は電圧に押され抵抗に制限される電荷の流れ：V = IR。回路の問題は2つの収支ルールで解ける：どの分岐点でも「入る電流 = 出る電流」、どの閉回路でも「電圧の和 = 0」。電力は P = IV = I²R = V²/R — わかっている量に合わせて式を選ぶ。',
    },
    body: {
      en: r`## Ohm's law and resistance
$V = IR$; resistance of a wire $R = \rho\dfrac{L}{S}$ (longer → more, thicker → less). Metals: $\rho$ rises with temperature ($\rho = \rho_0(1 + \alpha t)$). Current is the flow of electrons **opposite** to the conventional current arrow; $I = envS$ ($n$ electrons per volume, drift speed $v$).

## Series and parallel
| | series | parallel |
|---|---|---|
| same | current | voltage |
| total $R$ | $R_1 + R_2$ | $\dfrac{R_1R_2}{R_1+R_2}$ (less than the smallest) |
| voltage/current split | $V \propto R$ | $I \propto 1/R$ |

## Kirchhoff's rules
:::fig circuit

1. **Junction**: $\sum I_{in} = \sum I_{out}$.
2. **Loop**: going around any closed loop, $\sum(\text{emf}) = \sum IR$. Choose a direction; an emf counts + if you pass − → +; an $IR$ counts + if you go with the assumed current. A negative answer just means the current is opposite to your guess.

## Real batteries
Terminal voltage $V = E - Ir$ ($E$ emf, $r$ internal resistance). Short circuit: $I = E/r$. Maximum power to an external $R$ when $R = r$. A voltmeter across an open battery reads $E$.

## Power and Joule heat
$P = IV = I^2R = \dfrac{V^2}{R}$; heat in time $t$: $Q = I^2Rt$. In **series** the bigger $R$ gets more heat ($I$ same, $P = I^2R$); in **parallel** the smaller $R$ gets more ($V$ same, $P = V^2/R$). Comparing "two equal resistors in series vs parallel across the same battery": parallel draws 4× the power.

## Meters and measurement
Ammeter: in series, tiny $r$; extend its range with a **shunt** in parallel. Voltmeter: in parallel, huge $r$; extend its range with a **multiplier** resistor in series. Wheatstone bridge balanced when $R_1/R_2 = R_3/R_4$ (no current through the galvanometer). Potentiometer measures emf with **zero current** drawn, so $r$ does not matter.

## Capacitor in a DC circuit
Steady state: no current through the capacitor branch; its voltage equals the voltage across whatever it is in parallel with. Just after switching: acts as a wire.`,
      ja: r`## オームの法則と抵抗
$V = IR$。導線の抵抗 $R = \rho\dfrac{L}{S}$（長いほど大、太いほど小）。金属の $\rho$ は温度で上がる（$\rho = \rho_0(1 + \alpha t)$）。電流は電子の流れで、向きは電流の矢印と**逆**。$I = envS$（$n$ 単位体積の電子数、$v$ 平均の速さ）。

## 直列と並列
| | 直列 | 並列 |
|---|---|---|
| 共通 | 電流 | 電圧 |
| 合成抵抗 | $R_1 + R_2$ | $\dfrac{R_1R_2}{R_1+R_2}$（最小の抵抗より小さい） |
| 分配 | $V \propto R$ | $I \propto 1/R$ |

## キルヒホッフの法則
:::fig circuit

1. **分岐点**：$\sum I_{入} = \sum I_{出}$。
2. **閉回路**：どの閉回路でも $\sum(\text{起電力}) = \sum IR$。回る向きを決め、起電力は − → + に通れば +、$IR$ は仮定した電流の向きに通れば +。答えが負なら電流は仮定と逆向きというだけ。

## 実際の電池
端子電圧 $V = E - Ir$（$E$ 起電力、$r$ 内部抵抗）。短絡：$I = E/r$。外部抵抗 $R$ が受け取る電力は $R = r$ で最大。開放した電池に電圧計をつなぐと $E$ を示す。

## 電力とジュール熱
$P = IV = I^2R = \dfrac{V^2}{R}$。時間 $t$ の熱：$Q = I^2Rt$。**直列**では大きい $R$ ほど発熱大（$I$ 同じ、$P = I^2R$）、**並列**では小さい $R$ ほど発熱大（$V$ 同じ、$P = V^2/R$）。「同じ抵抗2個を同じ電池に直列 vs 並列」：並列は4倍の電力。

## 計器と測定
電流計：直列、$r$ 極小。測定範囲は**分流器**（並列）で拡大。電圧計：並列、$r$ 極大。範囲は**倍率器**（直列）で拡大。ホイートストンブリッジは $R_1/R_2 = R_3/R_4$ でつり合う（検流計に電流なし）。電位差計は**電流を流さずに**起電力を測るので $r$ が効かない。

## 直流回路中のコンデンサー
定常状態：コンデンサーの枝に電流は流れない。その電圧は並列になっている部分の電圧に等しい。スイッチを入れた直後：導線として扱う。`,
    },
    exam: {
      en: ['Equal resistors wired two different ways to the same battery: ratio of total power, current in one resistor, or power in an unknown resistor from a branch current (block IV, most years).', 'Circuit with two batteries: apply the loop rule to find each current.', 'Internal resistance: terminal voltage vs current graph — intercept $E$, slope $-r$.'],
      ja: ['同じ抵抗を2通りに配線して同じ電池につなぐ：全電力の比、ある抵抗の電流、枝の電流から未知の抵抗の消費電力（大問 IV、ほぼ毎年）。', '電池2個の回路：閉回路の法則で各電流。', '内部抵抗：端子電圧–電流グラフ — 切片 $E$、傾き $-r$。'],
    },
    traps: {
      en: ['Parallel resistance is **smaller** than either resistor; adding a parallel branch increases the total current.', 'A voltmeter across a battery under load reads $E - Ir$, less than the emf.', 'In the steady state no current flows **through** a capacitor, but the resistors in series with it may still carry current in another loop.'],
      ja: ['並列の合成抵抗はどちらの抵抗より**小さい**。並列の枝を足すと全電流は増える。', '負荷をつないだ電池の電圧計の読みは $E - Ir$ で起電力より小さい。', '定常状態でコンデンサー**を通る**電流はないが、それと直列の抵抗は別の閉回路で電流を流していることがある。'],
    },
    followups: {
      en: ['Walk through a two-loop Kirchhoff problem with numbers.', 'Why does parallel wiring draw more power than series?', 'Why is power to the load maximal when R = r?', 'How do I treat a capacitor in a DC circuit at steady state?'],
      ja: ['2つの閉回路のキルヒホッフの問題を数値で解いて。', '並列の方が直列より電力を多く使うのはなぜ？', 'R = r で負荷の電力が最大になるのはなぜ？', '定常状態の直流回路でコンデンサーはどう扱う？'],
    },
  },
  {
    id: 'semiconductors',
    core: {
      en: 'Pure silicon barely conducts; adding a few atoms with 5 valence electrons donates free electrons (n-type), adding atoms with 3 leaves holes (p-type). Join p to n and current flows one way only — the diode — because forward bias pushes carriers across the junction and reverse bias pulls them away.',
      ja: '純粋なケイ素はほとんど電気を通さない。価電子5個の原子を少し混ぜると自由電子が生まれ（n型）、3個の原子を混ぜると正孔が生まれる（p型）。p と n を接合すると電流は一方向にしか流れない — ダイオード。順方向ではキャリアが接合面を越えて押し込まれ、逆方向では引き離されるから。',
    },
    body: {
      en: r`## Conductors, insulators, semiconductors
Semiconductors (Si, Ge) have resistivity between metals and insulators, and — unlike metals — their resistance **falls** as temperature rises (more electrons freed). Pure ("intrinsic") Si has 4 valence electrons all used in bonds → very few carriers.

## Doping
| type | dopant | extra | majority carrier |
|---|---|---|---|
| n-type | 5 valence e⁻ (P, As, Sb) | one spare electron per atom | electrons (negative) |
| p-type | 3 valence e⁻ (B, Al, Ga, In) | one missing bond = **hole** | holes (act as positive charges) |

Both types are electrically **neutral** overall; "n" and "p" describe the mobile carriers, not the net charge. A hole moves when a neighbouring electron hops into it, so it behaves like a + charge moving the other way.

## p–n junction and the diode
At the junction electrons and holes recombine, leaving a thin **depletion layer** with a built-in field that stops further flow.
- **Forward bias** (p connected to +, n to −): the external voltage pushes holes and electrons toward the junction, the barrier shrinks, current flows (after ≈ 0.6 V for Si).
- **Reverse bias** (p to −): carriers are pulled away, the depletion layer widens, essentially no current.
Symbol: arrow points in the direction of conventional current (p → n).

## Uses
- **Rectification**: a diode turns AC into pulsating DC (half-wave); four diodes in a bridge give full-wave rectification. The EJU shows an AC source with a diode and a resistor and asks for the voltage graph across the resistor.
- LED (emits light when forward-biased), solar cell (light creates carriers → current), transistor (two junctions, amplifies), thermistor.

## I–V characteristic
Forward: almost zero current until the threshold, then steeply rising. Reverse: negligible current. So a diode is "ideal wire one way, open circuit the other".`,
      ja: r`## 導体・絶縁体・半導体
半導体（Si, Ge）の抵抗率は金属と絶縁体の中間で、金属と違って温度が上がると抵抗が**下がる**（自由になる電子が増える）。純粋な（真性）Si は価電子4個をすべて結合に使うのでキャリアが極めて少ない。

## ドーピング
| 型 | 不純物 | 余分なもの | 多数キャリア |
|---|---|---|---|
| n型 | 価電子5個（P, As, Sb） | 原子1個につき電子1個余る | 電子（負） |
| p型 | 価電子3個（B, Al, Ga, In） | 結合1本が不足 = **正孔（ホール）** | 正孔（正電荷のようにふるまう） |

どちらの型も全体としては電気的に**中性**。「n」「p」は動けるキャリアの符号であって正味の電荷ではない。正孔は隣の電子が飛び込むことで動くので、逆向きに動く＋電荷のように見える。

## p–n 接合とダイオード
接合面で電子と正孔が再結合し、薄い**空乏層**とそれ以上の流れを止める内部電場ができる。
- **順方向**（p を ＋、n を −）：外部電圧が正孔と電子を接合面へ押し、障壁が小さくなり電流が流れる（Si では約 0.6 V 以上）。
- **逆方向**（p を −）：キャリアが引き離され空乏層が広がり、電流はほぼ流れない。
記号：矢印は電流の向き（p → n）。

## 用途
- **整流**：ダイオードで交流を脈流の直流にする（半波整流）。4個のブリッジで全波整流。EJUは交流電源＋ダイオード＋抵抗の回路で抵抗にかかる電圧のグラフを問う。
- LED（順方向で発光）、太陽電池（光がキャリアをつくる → 電流）、トランジスタ（接合2つ、増幅）、サーミスタ。

## 電流–電圧特性
順方向：しきい値まではほぼ0、その後急激に増加。逆方向：ほぼ0。つまりダイオードは「一方向には導線、逆方向には断線」。`,
    },
    exam: {
      en: ['Which statement about n-type / p-type / holes is correct (e.g. "n-type is negatively charged" is false).', 'AC through a diode and resistor: choose the voltage–time graph across the resistor (half-wave).', 'Which way does current flow / which diodes conduct in a small diode circuit.'],
      ja: ['n型・p型・正孔についての正しい記述（「n型は負に帯電」は誤り、など）。', 'ダイオードと抵抗に交流を流す：抵抗の電圧–時間グラフを選ぶ（半波整流）。', '小さなダイオード回路で電流はどちらへ流れるか、どのダイオードが導通するか。'],
    },
    traps: {
      en: ['n-type material is **not** negatively charged; the donor atoms are + ions balancing the free electrons.', 'Semiconductor resistance decreases with temperature — the opposite of metals.', 'The diode arrow shows conventional current (p→n); electrons move the other way.'],
      ja: ['n型半導体は負に帯電**していない**。ドナー原子が＋イオンになって自由電子とつり合っている。', '半導体の抵抗は温度が上がると減る — 金属と逆。', 'ダイオードの矢印は電流の向き（p→n）。電子は逆向きに動く。'],
    },
    followups: {
      en: ['Explain how a hole "moves" even though it is the absence of an electron.', 'Why does the depletion layer stop current, and how does forward bias overcome it?', 'Draw (in words) the output of a half-wave rectifier and a bridge rectifier.', 'Why does heating a semiconductor lower its resistance?'],
      ja: ['電子の欠けている場所なのに正孔が「動く」しくみを説明して。', '空乏層が電流を止め、順方向電圧がそれを乗り越えるしくみは？', '半波整流とブリッジ整流の出力を言葉で描いて。', '半導体を温めると抵抗が下がるのはなぜ？'],
    },
  },
  {
    id: 'magnetic-field',
    core: {
      en: 'Moving charges (currents) create magnetic fields that circle around them; the right-hand screw rule gives the direction. Three shapes to know: a straight wire (B = μ₀I/2πr, circles), a circular loop (B = μ₀I/2r at the centre), and a solenoid (B = μ₀nI, uniform inside). Fields from several currents add as vectors.',
      ja: '動く電荷（電流）はまわりを回る磁場をつくる。向きは右ねじの法則。覚える形は3つ：直線電流（B = μ₀I/2πr、同心円）、円形電流（中心で B = μ₀I/2r）、ソレノイド（内部で B = μ₀nI、一様）。複数の電流の磁場はベクトルとして足す。',
    },
    body: {
      en: r`## Magnets and fields
Field lines leave N and enter S; like poles repel. The Earth's geographic north is a magnetic **south** pole (that is why compass N points there). Magnetic field $H$ (A/m) and flux density $B = \mu H$ (tesla); in air $\mu = \mu_0 = 4\pi\times10^{-7}$ T·m/A. Flux $\Phi = BS$ (weber).

## Right-hand screw rule
Thumb along the current → fingers curl in the direction of $B$ around a straight wire. For a loop or coil, curl fingers along the current → thumb gives $B$ inside (the N side).

:::fig wire-field

## The three formulas
| current | $B$ | where |
|---|---|---|
| straight wire | $\dfrac{\mu_0 I}{2\pi r}$ | circles around the wire, falls as $1/r$ |
| circular loop radius $r$ | $\dfrac{\mu_0 I}{2r}$ | at the centre, perpendicular to the loop |
| solenoid, $n$ turns per metre | $\mu_0 n I$ | uniform inside, ≈ 0 outside; independent of radius |

($N$ turns on a loop: multiply by $N$. In terms of $H$: $H = I/2\pi r$, $I/2r$, $nI$.)

## Superposition
Two parallel wires, currents $I_1$, $I_2$, separated by $d$:
- Same direction → field between them is **reduced** (opposite contributions); zero at the point where $\dfrac{I_1}{x} = \dfrac{I_2}{d-x}$.
- Opposite direction → fields add between the wires, cancel somewhere outside (nearer the smaller current).
Draw the small circle arrows around each wire at the point in question and add.

## Magnetic materials
Ferromagnets (Fe, Ni, Co) are strongly magnetised in a field and keep it (permanent magnets); paramagnets weakly align; diamagnets weakly oppose. A coil with an iron core has a much larger $B$ (electromagnet).`,
      ja: r`## 磁石と磁場
磁力線は N から出て S に入る。同じ極は反発。地球の北極付近は磁石としては **S 極**（だから方位磁針の N がそちらを向く）。磁場 $H$（A/m）と磁束密度 $B = \mu H$（テスラ）。空気中では $\mu = \mu_0 = 4\pi\times10^{-7}$ T·m/A。磁束 $\Phi = BS$（ウェーバ）。

## 右ねじの法則
親指を電流の向き → 指の曲がる向きが直線電流のまわりの $B$。ループやコイルでは指を電流に沿って曲げる → 親指が内部の $B$（N 側）。

:::fig wire-field

## 3つの公式
| 電流 | $B$ | 場所 |
|---|---|---|
| 直線電流 | $\dfrac{\mu_0 I}{2\pi r}$ | 導線のまわりの同心円、$1/r$ で減る |
| 半径 $r$ の円形電流 | $\dfrac{\mu_0 I}{2r}$ | 中心、面に垂直 |
| 1 m あたり $n$ 巻きのソレノイド | $\mu_0 n I$ | 内部で一様、外部はほぼ0。半径によらない |

（円形電流が $N$ 巻きなら $N$ 倍。$H$ で書くと $H = I/2\pi r$、$I/2r$、$nI$。）

## 重ね合わせ
間隔 $d$ の平行な2本の導線、電流 $I_1$、$I_2$：
- 同じ向き → 間の磁場は**弱まる**（逆向きの寄与）。$\dfrac{I_1}{x} = \dfrac{I_2}{d-x}$ となる点で0。
- 逆向き → 間では足し合い、外側のどこか（小さい電流の側）で打ち消す。
問われている点で各導線のまわりの小さな円の矢印を描いて足す。

## 磁性体
強磁性体（Fe, Ni, Co）は磁場中で強く磁化され、それを保つ（永久磁石）。常磁性体は弱くそろい、反磁性体は弱く逆らう。鉄心入りコイルは $B$ がはるかに大きい（電磁石）。`,
    },
    exam: {
      en: ['Two or three long parallel wires: where the net field is zero (ratio $d/a$), or the magnitude and direction of $B$ at a given point (block IV, very frequent).', 'Compare $B$ at the centre of a loop vs inside a solenoid when $I$ or $r$ changes.', 'Direction of the field from a loop or solenoid given the winding direction.'],
      ja: ['平行な長い導線2〜3本：合成磁場が0になる点（$d/a$ の比）、ある点での $B$ の大きさと向き（大問 IV、超頻出）。', '$I$ や $r$ を変えたときの円形電流の中心と ソレノイド内部の $B$ の比較。', '巻き方が与えられたループやソレノイドの磁場の向き。'],
    },
    traps: {
      en: ['The field of a straight wire is $\\propto 1/r$, not $1/r^2$ (that is a point charge).', 'The solenoid field does not depend on its radius, only on turns **per length** and $I$.', 'Field lines of a current form closed loops — there are no magnetic "charges" where they start or end.'],
      ja: ['直線電流の磁場は $1/r^2$ ではなく $\\propto 1/r$（$1/r^2$ は点電荷）。', 'ソレノイドの磁場は半径によらず、**単位長さあたり**の巻数と $I$ だけで決まる。', '電流の磁力線は閉じたループ — 始点や終点となる磁気の「電荷」はない。'],
    },
    followups: {
      en: ['Show the two-wire zero-field calculation for same and opposite currents.', 'Why is the solenoid field uniform inside and independent of radius?', 'Explain the right-hand screw rule with a loop example.', 'Why does the field of a wire fall as 1/r?'],
      ja: ['同じ向きと逆向きの電流で磁場が0になる点の計算を見せて。', 'ソレノイドの磁場が内部で一様で半径によらないのはなぜ？', 'ループの例で右ねじの法則を説明して。', '直線電流の磁場が 1/r で減るのはなぜ？'],
    },
  },
  {
    id: 'magnetic-force',
    core: {
      en: 'A magnetic field pushes sideways on moving charge: on a wire F = IBl sin θ, on a single charge F = qvB sin θ, always perpendicular to both the motion and B (Fleming\'s left hand / F = IL × B). Because the force is perpendicular to v it never does work — it only bends the path, giving circles of radius r = mv/qB.',
      ja: '磁場は動く電荷を横向きに押す：導線では F = IBl sin θ、電荷1個では F = qvB sin θ。向きは常に運動と B の両方に垂直（フレミングの左手 / F = IL × B）。力が v に垂直なので仕事をせず、経路を曲げるだけ → 半径 r = mv/qB の円運動。',
    },
    body: {
      en: r`## Force on a current
$$F = IBl\sin\theta$$ ($\theta$ = angle between wire and $B$; zero when parallel, maximum when perpendicular).
**Direction** (Fleming's left hand): First finger = Field, seCond = Current, thuMb = Motion/force. Equivalent: $\vec F = I\vec l\times\vec B$.

:::fig left-hand

## Parallel wires
Wire 1 makes $B = \dfrac{\mu_0 I_1}{2\pi d}$ at wire 2; force per length on wire 2: $\dfrac{F}{l} = \dfrac{\mu_0 I_1 I_2}{2\pi d}$.
**Same direction → attract; opposite → repel.** (Check with the left-hand rule once, then remember it.)

## Lorentz force on a charge
$$F = qvB\sin\theta$$ Positive charge: left-hand rule with current in the direction of $v$; negative charge: reverse the force. The force is always ⊥ $v$ → **no work, speed constant**.
- $v \perp B$: uniform circular motion, $qvB = \dfrac{mv^2}{r}$ → $r = \dfrac{mv}{qB}$, $T = \dfrac{2\pi m}{qB}$ (independent of $v$!).
- $v$ at an angle: circle + drift along $B$ = helix.
- $\vec E \perp \vec B$ velocity selector: undeflected when $qE = qvB$ → $v = E/B$.

## Applications
- **Mass spectrometer**: $r \propto m$ for the same $q$, $v$ → heavier ions bend less.
- **Cyclotron**: $T$ independent of $v$, so a fixed-frequency voltage keeps kicking the particle.
- **Hall effect**: current in a slab in a field; carriers are pushed to one side until the transverse field balances: $qE_H = qvB$. The sign of the Hall voltage reveals whether carriers are electrons or holes; $V_H = vBd$, and with $I = nqvS$ you get $n$.
- **Motor**: a coil in a field feels a torque (forces on opposite sides are opposite).

## Force balance problems
A rod of mass $m$ hanging by threads in a horizontal field, current $I$: horizontal $F = IBl$ tilts the threads by $\tan\theta = IBl/mg$. A rod on rails on a slope stays put when $IBl\cos\theta = mg\sin\theta$.`,
      ja: r`## 電流が受ける力
$$F = IBl\sin\theta$$（$\theta$ = 導線と $B$ のなす角。平行で0、垂直で最大。）
**向き**（フレミングの左手）：人差し指 = 磁場、中指 = 電流、親指 = 力。同じことを $\vec F = I\vec l\times\vec B$ とも書く。

:::fig left-hand

## 平行電流
導線1が導線2の位置につくる $B = \dfrac{\mu_0 I_1}{2\pi d}$。導線2の単位長さあたりの力：$\dfrac{F}{l} = \dfrac{\mu_0 I_1 I_2}{2\pi d}$。
**同じ向き → 引き合う、逆向き → 反発。**（左手で一度確認して、あとは覚える。）

## 電荷が受けるローレンツ力
$$F = qvB\sin\theta$$ 正電荷：$v$ の向きを電流として左手の法則。負電荷：力を逆にする。力は常に $v$ に垂直 → **仕事をせず、速さ一定**。
- $v \perp B$：等速円運動、$qvB = \dfrac{mv^2}{r}$ → $r = \dfrac{mv}{qB}$、$T = \dfrac{2\pi m}{qB}$（$v$ によらない！）。
- 斜めの $v$：円運動 ＋ $B$ 方向の等速 = らせん。
- $\vec E \perp \vec B$ の速度選別器：$qE = qvB$ のとき直進 → $v = E/B$。

## 応用
- **質量分析器**：同じ $q$、$v$ なら $r \propto m$ → 重いイオンほど曲がらない。
- **サイクロトロン**：$T$ が $v$ によらないので、一定周波数の電圧で加速し続けられる。
- **ホール効果**：磁場中の板に電流。キャリアが片側に寄り、横向きの電場がつり合うまで：$qE_H = qvB$。ホール電圧の符号でキャリアが電子か正孔かわかる。$V_H = vBd$、$I = nqvS$ と合わせて $n$ が求まる。
- **モーター**：磁場中のコイルは偶力を受ける（向かい合う辺の力が逆向き）。

## 力のつり合いの問題
水平な磁場中に糸でつるした質量 $m$ の棒に電流 $I$：水平な力 $F = IBl$ で糸が $\tan\theta = IBl/mg$ だけ傾く。斜面上のレールの棒は $IBl\cos\theta = mg\sin\theta$ で静止。`,
    },
    exam: {
      en: ['Rod hanging in a field: find $B$ from the tilt angle; or a rod on rails: current needed to hold it on a slope.', 'Charged particle enters a field region: radius, where it exits, time inside (half a period), how $r$ changes with $B$ or $v$ (block IV, frequent).', 'Hall effect: direction of the Hall voltage for electrons vs holes.'],
      ja: ['磁場中につるした棒：傾き角から $B$。レール上の棒：斜面で静止させる電流。', '磁場領域に入る荷電粒子：半径、出る位置、滞在時間（半周期）、$B$ や $v$ で $r$ がどう変わるか（大問 IV、頻出）。', 'ホール効果：電子と正孔でホール電圧の向き。'],
    },
    traps: {
      en: ['A magnetic force never changes a particle\'s **speed** — only its direction.', 'The period of circular motion in a field is independent of the speed (bigger $v$ → bigger circle, same $T$).', 'For a negative charge, reverse the direction given by the left-hand rule.'],
      ja: ['磁気力は粒子の**速さ**を変えない — 向きだけ。', '磁場中の円運動の周期は速さによらない（$v$ が大きいほど円は大きいが $T$ は同じ）。', '負電荷では左手の法則の向きを逆にする。'],
    },
    followups: {
      en: ['Why does the magnetic force do no work?', 'Derive r = mv/qB and T = 2πm/qB.', 'Explain the Hall effect and how it tells electrons from holes.', 'Show why parallel currents attract with the left-hand rule.'],
      ja: ['磁気力が仕事をしないのはなぜ？', 'r = mv/qB と T = 2πm/qB を導いて。', 'ホール効果と、それで電子と正孔を区別するしくみを説明して。', '左手の法則で平行電流が引き合う理由を見せて。'],
    },
  },
  {
    id: 'em-induction',
    core: {
      en: 'Change the magnetic flux through a loop and a voltage appears: V = −ΔΦ/Δt (Faraday). The minus sign is Lenz\'s law — the induced current always fights the change that made it. A rod cutting field lines at speed v gives V = vBl, which is just the Lorentz force pushing the rod\'s electrons along it.',
      ja: 'ループを貫く磁束が変わると電圧が生じる：V = −ΔΦ/Δt（ファラデー）。マイナスはレンツの法則 — 誘導電流は自分を生んだ変化に必ず逆らう。速さ v で磁力線を横切る棒には V = vBl が生じ、これは棒の中の電子がローレンツ力で押されているだけ。',
    },
    body: {
      en: r`## Faraday's law
$$V = -N\frac{\Delta\Phi}{\Delta t}, \qquad \Phi = BS\cos\theta$$
Flux changes when $B$ changes, when the area changes, or when the loop rotates. Given a $B$–$t$ graph, the induced emf is $\propto$ **slope** (zero where $B$ is constant, largest where $B$ changes fastest).

## Lenz's law (direction)
The induced current makes a field that **opposes the change in flux**:
- flux increasing → induced field points against $B$;
- flux decreasing → induced field points along $B$.
Then use the right-hand rule to turn that field into a current direction. A magnet's N pole approaching a loop makes the loop's near face N (repels the magnet); pulling it away makes the face S (attracts). Either way the loop **resists** the motion — that is where the work to generate electricity comes from.

:::fig induction

## Motional emf
Rod of length $l$ moving at $v$ across $B$: $$V = vBl$$
Why: each electron in the rod feels $evB$ along the rod, piling up at one end until $eE = evB$, i.e. $E = vB$ and $V = El = vBl$. The end where positive charge accumulates (found with the left-hand rule using $v$ as the current direction) is the + terminal.
On rails with resistance $R$: $I = vBl/R$, the rod feels a braking force $F = IBl = B^2l^2v/R$, and the external agent's power $Fv$ equals the Joule heat $I^2R$ — energy is conserved.

## Eddy currents
A moving conductor near a magnet develops swirling currents that oppose the motion (magnetic braking, induction cooking, a magnet falling slowly through a copper pipe).

## Self- and mutual induction
- Self-induction: a coil opposes changes in its **own** current: $V = -L\dfrac{\Delta I}{\Delta t}$; energy stored $\tfrac12 LI^2$. Switch-on: current rises gradually; switch-off: large spark voltage.
- Mutual induction: changing current in coil 1 induces $V_2 = -M\dfrac{\Delta I_1}{\Delta t}$ in coil 2.
- **Transformer**: $\dfrac{V_1}{V_2} = \dfrac{N_1}{N_2}$, and (ideal) $V_1I_1 = V_2I_2$ — step up the voltage, step down the current. Works only with AC (needs changing flux).`,
      ja: r`## ファラデーの法則
$$V = -N\frac{\Delta\Phi}{\Delta t}, \qquad \Phi = BS\cos\theta$$
$B$ が変わる、面積が変わる、ループが回転する、のいずれでも磁束は変わる。$B$–$t$ グラフが与えられたら誘導起電力 ∝ **傾き**（$B$ 一定で0、最も速く変わるところで最大）。

## レンツの法則（向き）
誘導電流は**磁束の変化に逆らう**磁場をつくる：
- 磁束が増える → 誘導磁場は $B$ と逆向き。
- 磁束が減る → 誘導磁場は $B$ と同じ向き。
それを右ねじの法則で電流の向きに直す。磁石の N 極がループに近づくとループの手前の面は N（磁石を押し返す）。遠ざけると S（引きとめる）。どちらでもループは運動に**逆らう** — 発電の仕事はそこから来る。

:::fig induction

## 導体棒の誘導起電力
長さ $l$ の棒が $B$ を速さ $v$ で横切る：$$V = vBl$$
理由：棒の中の各電子は棒に沿って $evB$ を受け、片端にたまり、$eE = evB$ つまり $E = vB$、$V = El = vBl$ になるまで続く。正電荷がたまる端（$v$ を電流の向きとして左手の法則）が ＋ 極。
抵抗 $R$ のレール上では $I = vBl/R$、棒はブレーキ力 $F = IBl = B^2l^2v/R$ を受け、外力の仕事率 $Fv$ はジュール熱 $I^2R$ に等しい — エネルギー保存。

## 渦電流
磁石の近くで動く導体には渦状の電流が生じ運動に逆らう（磁気ブレーキ、IH調理器、銅管をゆっくり落ちる磁石）。

## 自己誘導・相互誘導
- 自己誘導：コイルは**自分自身**の電流の変化に逆らう：$V = -L\dfrac{\Delta I}{\Delta t}$。蓄えるエネルギー $\tfrac12 LI^2$。スイッチを入れると電流は徐々に増え、切ると大きな火花電圧。
- 相互誘導：コイル1の電流変化がコイル2に $V_2 = -M\dfrac{\Delta I_1}{\Delta t}$ を誘導。
- **変圧器**：$\dfrac{V_1}{V_2} = \dfrac{N_1}{N_2}$、（理想では）$V_1I_1 = V_2I_2$ — 電圧を上げれば電流は下がる。交流でのみ動作（変化する磁束が必要）。`,
    },
    exam: {
      en: ['Coil moving toward/away from a magnet, or a loop entering a field region: direction of induced current and of the force on the loop (block IV, most years).', '$B$–$t$ graph given: sketch/choose the induced current vs time (proportional to slope, sign flips where the slope flips).', 'Rod on rails: emf $vBl$, current, braking force, power balance; or the terminal speed of a falling rod.'],
      ja: ['磁石に近づく／遠ざかるコイル、磁場領域に入るループ：誘導電流の向きとループにはたらく力の向き（大問 IV、ほぼ毎年）。', '$B$–$t$ グラフ：誘導電流–時間のグラフを描く・選ぶ（傾きに比例、傾きの符号が変わる所で反転）。', 'レール上の棒：起電力 $vBl$、電流、ブレーキ力、仕事率の収支、落下する棒の終端速度。'],
    },
    traps: {
      en: ['Induction needs a **change** of flux; a loop sitting still in a constant field has no emf however strong $B$ is.', 'The induced current opposes the **change**, not the field itself: when flux decreases the induced field is **along** $B$.', 'A transformer changes voltage, not power; with DC input it produces nothing after the first instant.'],
      ja: ['誘導には磁束の**変化**が必要。一定の磁場中で静止したループには $B$ がどんなに強くても起電力はない。', '誘導電流が逆らうのは**変化**であって磁場そのものではない：磁束が減るときの誘導磁場は $B$ と**同じ向き**。', '変圧器は電圧を変えるが電力は変えない。直流を入れても最初の一瞬以外は何も出ない。'],
    },
    followups: {
      en: ['Explain Lenz\'s law with the magnet-and-loop example in both directions.', 'Derive V = vBl from the Lorentz force on the electrons.', 'Show the energy balance for a rod on rails: who does the work?', 'Why does a magnet fall slowly through a copper pipe?'],
      ja: ['磁石とループの例でレンツの法則を近づける場合と遠ざける場合の両方で説明して。', '電子にはたらくローレンツ力から V = vBl を導いて。', 'レール上の棒のエネルギー収支：誰が仕事をしている？', '銅管の中を磁石がゆっくり落ちるのはなぜ？'],
    },
  },
  {
    id: 'ac-circuits',
    core: {
      en: 'AC is a voltage that swings as a sine wave; "100 V" means the effective (RMS) value, peak/√2. A resistor obeys Ohm\'s law instant by instant; a coil resists changes in current (reactance ωL, current lags by 90°); a capacitor resists changes in voltage (reactance 1/ωC, current leads by 90°). Only the resistor consumes energy on average.',
      ja: '交流は正弦波で振れる電圧。「100 V」は実効値で、最大値/√2。抵抗は各瞬間でオームの法則に従う。コイルは電流の変化に逆らう（リアクタンス ωL、電流は 90° 遅れる）。コンデンサーは電圧の変化に逆らう（リアクタンス 1/ωC、電流は 90° 進む）。平均してエネルギーを消費するのは抵抗だけ。',
    },
    body: {
      en: r`## Generating AC
A coil rotating at $\omega$ in a field: $\Phi = BS\cos\omega t$ → $V = V_0\sin\omega t$ with $V_0 = NBS\omega$. Frequency $f = \omega/2\pi$ (50 or 60 Hz in Japan).

## Effective (RMS) values
$$V_e = \frac{V_0}{\sqrt2}, \qquad I_e = \frac{I_0}{\sqrt2}$$
Defined so that a resistor heats as it would with a DC of that size: $\bar P = I_eV_e = I_e^2R$. Household "100 V" is $V_e$; the peak is 141 V.

## The three elements
:::fig ac-phase

| element | opposes | "resistance" (reactance) | phase of $I$ vs $V$ | average power |
|---|---|---|---|---|
| resistor $R$ | — | $R$ | in phase | $I_eV_e$ |
| coil $L$ | change of **current** | $X_L = \omega L$ (bigger at high $f$) | $I$ **lags** by $\pi/2$ | 0 |
| capacitor $C$ | change of **voltage** | $X_C = \dfrac{1}{\omega C}$ (smaller at high $f$) | $I$ **leads** by $\pi/2$ | 0 |

Memory: a coil blocks high frequencies (and DC passes freely); a capacitor blocks DC and passes high frequencies.
Why zero power for $L$ and $C$: they store energy for a quarter cycle and give it back the next quarter.

## Series RLC
Impedance $Z = \sqrt{R^2 + (\omega L - \frac{1}{\omega C})^2}$, $I_e = V_e/Z$. **Resonance** when $\omega L = \dfrac{1}{\omega C}$, i.e. $f_0 = \dfrac{1}{2\pi\sqrt{LC}}$: $Z$ is minimal ($= R$), current maximal — radio tuning. An LC circuit with no resistor oscillates at this frequency (energy sloshing between $\tfrac12 CV^2$ and $\tfrac12 LI^2$).

## Electromagnetic waves
Changing $E$ makes $B$, changing $B$ makes $E$ → a self-sustaining transverse wave travelling at $c = 1/\sqrt{\varepsilon_0\mu_0} = 3.0\times10^8$ m/s in vacuum, $\vec E \perp \vec B \perp$ direction of travel. Produced by oscillating charges (antenna, LC oscillator).
Spectrum by increasing frequency (decreasing $\lambda$): radio → microwave → infrared → visible (red 700 nm … violet 400 nm) → ultraviolet → X-ray → gamma. All travel at $c$ in vacuum; all can be reflected, refracted, polarised.`,
      ja: r`## 交流の発生
磁場中で $\omega$ で回転するコイル：$\Phi = BS\cos\omega t$ → $V = V_0\sin\omega t$、$V_0 = NBS\omega$。周波数 $f = \omega/2\pi$（日本では 50 または 60 Hz）。

## 実効値
$$V_e = \frac{V_0}{\sqrt2}, \qquad I_e = \frac{I_0}{\sqrt2}$$
「同じ大きさの直流と同じだけ抵抗を発熱させる値」として定義：$\bar P = I_eV_e = I_e^2R$。家庭の「100 V」は $V_e$、最大値は 141 V。

## 3つの素子
:::fig ac-phase

| 素子 | 逆らうもの | 「抵抗」（リアクタンス） | $I$ の $V$ に対する位相 | 平均電力 |
|---|---|---|---|---|
| 抵抗 $R$ | — | $R$ | 同位相 | $I_eV_e$ |
| コイル $L$ | **電流**の変化 | $X_L = \omega L$（高周波で大） | $I$ は $\pi/2$ **遅れる** | 0 |
| コンデンサー $C$ | **電圧**の変化 | $X_C = \dfrac{1}{\omega C}$（高周波で小） | $I$ は $\pi/2$ **進む** | 0 |

覚え方：コイルは高周波を通しにくい（直流は素通し）。コンデンサーは直流を通さず高周波を通す。
$L$、$C$ の電力が0の理由：1/4 周期エネルギーを蓄え、次の 1/4 周期で返す。

## RLC 直列回路
インピーダンス $Z = \sqrt{R^2 + (\omega L - \frac{1}{\omega C})^2}$、$I_e = V_e/Z$。$\omega L = \dfrac{1}{\omega C}$ すなわち $f_0 = \dfrac{1}{2\pi\sqrt{LC}}$ で**共振**：$Z$ 最小（$= R$）、電流最大 — ラジオの選局。抵抗のない LC 回路はこの周波数で振動する（$\tfrac12 CV^2$ と $\tfrac12 LI^2$ の間でエネルギーが行き来）。

## 電磁波
変化する $E$ が $B$ をつくり、変化する $B$ が $E$ をつくる → 自分で進む横波。真空中の速さ $c = 1/\sqrt{\varepsilon_0\mu_0} = 3.0\times10^8$ m/s、$\vec E \perp \vec B \perp$ 進行方向。振動する電荷（アンテナ、LC 発振回路）から出る。
周波数の低い順（波長の長い順）：電波 → マイクロ波 → 赤外線 → 可視光（赤 700 nm … 紫 400 nm）→ 紫外線 → X線 → γ線。真空中ではすべて $c$。反射・屈折・偏光する。`,
    },
    exam: {
      en: ['Given $V = V_0\\sin\\omega t$ across a coil or capacitor: sketch/choose the current graph (phase lead/lag) and the reactance.', 'Effective value questions: power in a resistor from peak voltage; a bulb\'s brightness with $L$ or $C$ in series when $f$ changes.', 'Resonant frequency of an LC circuit; order of the EM spectrum.'],
      ja: ['コイルやコンデンサーに $V = V_0\\sin\\omega t$：電流のグラフ（位相の進み・遅れ）とリアクタンス。', '実効値の問題：最大電圧から抵抗の電力、$L$ や $C$ を直列にした電球の明るさが $f$ でどう変わるか。', 'LC 回路の共振周波数、電磁波の並び順。'],
    },
    traps: {
      en: ['"100 V AC" is the RMS value; the peak is $100\\sqrt2$ V. Do not use $V_0$ in power formulas without dividing by 2.', 'A coil\'s reactance **rises** with frequency; a capacitor\'s **falls**. Swapping them is the classic error.', 'Coils and capacitors have zero **average** power, but instantaneous power is not zero.'],
      ja: ['「交流 100 V」は実効値。最大値は $100\\sqrt2$ V。電力の式に $V_0$ を2で割らずに入れない。', 'コイルのリアクタンスは周波数で**上がり**、コンデンサーは**下がる**。逆に覚えるのが定番の誤り。', 'コイルとコンデンサーの**平均**電力は0だが、瞬間の電力は0ではない。'],
    },
    followups: {
      en: ['Why does current lag voltage in a coil and lead in a capacitor?', 'Where does V₀/√2 come from? Show the averaging.', 'Why do L and C consume no average power?', 'Explain resonance in an RLC circuit and its use in a radio.'],
      ja: ['コイルで電流が電圧より遅れ、コンデンサーで進むのはなぜ？', 'V₀/√2 はどこから来る？平均の計算を見せて。', 'L と C が平均電力を消費しないのはなぜ？', 'RLC 回路の共振とラジオでの使い方を説明して。'],
    },
  },
  // ───────────────────────────── ATOMS ─────────────────────────────
  {
    id: 'electrons-light',
    core: {
      en: 'Light comes in packets of energy E = hf; an electron is knocked out of a metal only if one packet carries more than the work function W, and the leftover is its kinetic energy: ½mv² = hf − W. Conversely, particles behave as waves with λ = h/p. Everything small is both.',
      ja: '光はエネルギー E = hf のかたまり（光子）でやってくる。1個の光子が仕事関数 W より大きいエネルギーをもつときだけ電子が金属から飛び出し、残りが運動エネルギー：½mv² = hf − W。逆に粒子は λ = h/p の波としてふるまう。小さいものはどちらでもある。',
    },
    body: {
      en: r`## Electrons
- Cathode rays (from the − electrode in a discharge tube) are electrons: deflected by $E$ and $B$ fields toward the + plate. Thomson measured the specific charge $e/m = 1.76\times10^{11}$ C/kg; Millikan's oil-drop experiment showed charge comes in units of $e = 1.6\times10^{-19}$ C.
- Electron-volt: $1\ \mathrm{eV} = 1.6\times10^{-19}$ J, the energy gained through 1 V.

## Photoelectric effect (light as particles)
:::fig photoelectric

Observations that waves cannot explain:
1. Below a **threshold frequency** $f_0$ no electrons come out, however bright the light.
2. Above it, electrons come out **instantly**, and their maximum KE depends on **frequency**, not intensity.
3. Intensity only changes **how many** electrons (the current).

Einstein: light is photons of energy $E = hf = \dfrac{hc}{\lambda}$ ($h = 6.63\times10^{-34}$ J·s). One photon ejects one electron:
$$K_{max} = hf - W, \qquad W = hf_0$$
Stopping voltage $V_0$: $eV_0 = K_{max}$. A graph of $K_{max}$ (or $V_0$) against $f$ is a straight line of slope $h$ (or $h/e$) with intercept $-W$; it crosses the axis at $f_0$. Photon momentum $p = h/\lambda = E/c$.

## X-rays
Fast electrons hitting a metal: continuous spectrum with a **minimum wavelength** $\lambda_{min} = \dfrac{hc}{eV}$ (all of the electron's energy $eV$ becomes one photon) plus sharp characteristic lines. **Bragg reflection**: $2d\sin\theta = n\lambda$ for strong reflection from crystal planes (X-rays behave as waves).

## Compton effect
An X-ray photon bouncing off an electron loses energy → longer wavelength; momentum and energy are conserved as in a particle collision. Photons are particles with momentum.

## Matter waves (particles as waves)
de Broglie: $$\lambda = \frac{h}{p} = \frac{h}{mv}$$ Electron accelerated through $V$: $p = \sqrt{2meV}$, so $\lambda = \dfrac{h}{\sqrt{2meV}}$. Electron beams diffract from crystals (Davisson–Germer) and show interference — the basis of the electron microscope (tiny $\lambda$ → high resolution).`,
      ja: r`## 電子
- 陰極線（放電管の − 極から出る）は電子：$E$ や $B$ で ＋ 極側に曲がる。トムソンが比電荷 $e/m = 1.76\times10^{11}$ C/kg を測定。ミリカンの油滴実験で電荷は $e = 1.6\times10^{-19}$ C の整数倍とわかった。
- 電子ボルト：$1\ \mathrm{eV} = 1.6\times10^{-19}$ J、1 V で得るエネルギー。

## 光電効果（光は粒子）
:::fig photoelectric

波では説明できない観測事実：
1. **限界振動数** $f_0$ 以下ではどんなに明るくても電子は出ない。
2. それ以上なら電子は**即座に**出て、最大運動エネルギーは明るさでなく**振動数**で決まる。
3. 明るさは電子の**数**（電流）だけを変える。

アインシュタイン：光はエネルギー $E = hf = \dfrac{hc}{\lambda}$ の光子（$h = 6.63\times10^{-34}$ J·s）。光子1個が電子1個をたたき出す：
$$K_{max} = hf - W, \qquad W = hf_0$$
阻止電圧 $V_0$：$eV_0 = K_{max}$。$K_{max}$（または $V_0$）を $f$ に対してグラフにすると傾き $h$（または $h/e$）、切片 $-W$ の直線で、横軸を $f_0$ で切る。光子の運動量 $p = h/\lambda = E/c$。

## X線
高速電子を金属に当てる：連続スペクトルに**最短波長** $\lambda_{min} = \dfrac{hc}{eV}$（電子のエネルギー $eV$ が全部1個の光子になる）と鋭い固有X線。**ブラッグ反射**：結晶面で強く反射する条件 $2d\sin\theta = n\lambda$（X線は波としてふるまう）。

## コンプトン効果
X線光子が電子にぶつかってエネルギーを失う → 波長が長くなる。粒子の衝突と同じく運動量とエネルギーが保存。光子は運動量をもつ粒子。

## 物質波（粒子は波）
ド・ブロイ：$$\lambda = \frac{h}{p} = \frac{h}{mv}$$ 電圧 $V$ で加速した電子：$p = \sqrt{2meV}$、$\lambda = \dfrac{h}{\sqrt{2meV}}$。電子線は結晶で回折し（デビッソン・ガーマー）干渉を示す — 電子顕微鏡の原理（$\lambda$ が極小 → 高い分解能）。`,
    },
    exam: {
      en: ['Photoelectric graph: read $h$ from the slope, $W$ or $f_0$ from the intercept; what changes when intensity doubles (current, not $K_{max}$).', 'de Broglie wavelength of an electron with kinetic energy $K$ or accelerated through $V$ (block V single item, frequent).', 'Minimum X-ray wavelength for a given tube voltage; photon energy in eV from wavelength.'],
      ja: ['光電効果のグラフ：傾きから $h$、切片から $W$ や $f_0$。明るさを2倍にすると変わるもの（電流であって $K_{max}$ ではない）。', '運動エネルギー $K$ または電圧 $V$ で加速した電子のド・ブロイ波長（大問 V の1問、頻出）。', '管電圧からX線の最短波長、波長から光子のエネルギー（eV）。'],
    },
    traps: {
      en: ['Brighter light of the same colour does **not** make faster photoelectrons — only more of them.', 'The work function is a property of the **metal**; the threshold frequency changes with the metal, not with the light.', 'For matter waves use momentum $p$, not energy: $\\lambda = h/p$ — a heavier particle at the same speed has a **shorter** wavelength.'],
      ja: ['同じ色でより明るい光でも光電子は速く**ならない** — 数が増えるだけ。', '仕事関数は**金属**の性質。限界振動数は金属で決まり、光では変わらない。', '物質波はエネルギーでなく運動量 $p$：$\\lambda = h/p$ — 同じ速さなら重い粒子ほど波長は**短い**。'],
    },
    followups: {
      en: ['Why can a wave picture not explain the threshold frequency?', 'Show a photoelectric calculation from wavelength to stopping voltage.', 'Derive λ = h/√(2meV) for an accelerated electron.', 'What is the Compton effect evidence for?'],
      ja: ['波の描像で限界振動数を説明できないのはなぜ？', '波長から阻止電圧までの光電効果の計算を見せて。', '加速された電子の λ = h/√(2meV) を導いて。', 'コンプトン効果は何の証拠？'],
    },
  },
  {
    id: 'atoms-nuclei',
    core: {
      en: 'Electrons in an atom can only sit on certain energy levels; a photon is emitted or absorbed when an electron jumps, with hf = E_high − E_low — that is why spectra are lines. The nucleus is protons + neutrons held by the strong force; unstable ones decay (α, β, γ) at a fixed rate (half-life), and the small mass lost in nuclear reactions appears as energy, E = mc².',
      ja: '原子の電子は決まったエネルギー準位にしかいられない。電子が飛び移るとき hf = E_高 − E_低 の光子が放出・吸収される — だからスペクトルは線になる。原子核は陽子＋中性子が強い力で結びついたもの。不安定な核は一定の割合（半減期）で壊変（α・β・γ）し、核反応で失われたわずかな質量がエネルギー E = mc² になる。',
    },
    body: {
      en: r`## Bohr model of hydrogen
:::fig bohr

- Rutherford: α-particles scattered by gold foil → tiny, dense, positive nucleus.
- Bohr: electrons orbit only where the matter wave fits: $2\pi r = n\lambda$ ($n = 1, 2, 3\ldots$). Energy levels $$E_n = -\frac{13.6\ \mathrm{eV}}{n^2}$$ (negative = bound; $n = 1$ ground state; $E = 0$ = ionised).
- Photon on a jump: $hf = E_n - E_{n'}$, giving line spectra. Hydrogen series: Lyman (to $n=1$, UV), **Balmer** (to $n=2$, visible), Paschen (to $n=3$, IR). Ionisation energy of hydrogen = 13.6 eV.
- Rydberg formula: $\dfrac{1}{\lambda} = R\left(\dfrac{1}{n'^2} - \dfrac{1}{n^2}\right)$.

## Nuclei
Notation $^A_Z\mathrm{X}$: $Z$ protons (atomic number, decides the element), $A = Z + N$ nucleons (mass number). Isotopes: same $Z$, different $N$. Atomic mass unit u $= 1.66\times10^{-27}$ kg ($\tfrac{1}{12}$ of $^{12}$C).

## Radioactive decay
| decay | emitted | change in $Z$ | change in $A$ | penetration |
|---|---|---|---|---|
| α | $^4_2$He nucleus | $-2$ | $-4$ | stopped by paper |
| β⁻ | electron (n → p + e⁻ + ν̄) | $+1$ | 0 | few mm of Al |
| γ | high-energy photon | 0 | 0 | needs lead |

**Conservation** in every nuclear equation: total $A$ and total $Z$ are the same on both sides. Use this to find the unknown particle or count emitted neutrons.

## Half-life
:::fig decay

$$N = N_0\left(\tfrac12\right)^{t/T}$$ After $T$: half left; $2T$: quarter; $3T$: one eighth. Activity (decays per second) ∝ $N$, so it halves the same way. Carbon-14 ($T = 5730$ y) dating: fraction remaining → age.

## Mass–energy
$E = mc^2$; 1 u ≈ 931 MeV. **Mass defect**: a nucleus weighs **less** than its separate nucleons; the difference × $c^2$ is the binding energy. Energy released in a reaction $= (\text{mass before} - \text{mass after})c^2$.
- **Fission**: $^{235}$U + n → two fragments + 2–3 n + ~200 MeV → chain reaction (reactor, bomb).
- **Fusion**: light nuclei join (Sun: 4 ¹H → ⁴He), needs very high temperature to overcome repulsion.
Binding energy per nucleon peaks near iron: fission of heavy and fusion of light nuclei both move toward it, releasing energy.`,
      ja: r`## 水素原子のボーア模型
:::fig bohr

- ラザフォード：金箔でのα粒子の散乱 → 小さく重い正の原子核。
- ボーア：電子は物質波がちょうど収まる軌道にだけ存在：$2\pi r = n\lambda$（$n = 1, 2, 3\ldots$）。エネルギー準位 $$E_n = -\frac{13.6\ \mathrm{eV}}{n^2}$$（負 = 束縛。$n = 1$ が基底状態。$E = 0$ が電離）。
- 遷移で光子：$hf = E_n - E_{n'}$ → 線スペクトル。水素の系列：ライマン（$n=1$ へ、紫外）、**バルマー**（$n=2$ へ、可視）、パッシェン（$n=3$ へ、赤外）。水素の電離エネルギー = 13.6 eV。
- リュードベリの式：$\dfrac{1}{\lambda} = R\left(\dfrac{1}{n'^2} - \dfrac{1}{n^2}\right)$。

## 原子核
表記 $^A_Z\mathrm{X}$：陽子 $Z$ 個（原子番号、元素を決める）、核子 $A = Z + N$ 個（質量数）。同位体：同じ $Z$、異なる $N$。原子質量単位 u $= 1.66\times10^{-27}$ kg（$^{12}$C の $\tfrac{1}{12}$）。

## 放射性崩壊
| 崩壊 | 放出 | $Z$ の変化 | $A$ の変化 | 透過力 |
|---|---|---|---|---|
| α | $^4_2$He 原子核 | $-2$ | $-4$ | 紙で止まる |
| β⁻ | 電子（n → p + e⁻ + ν̄） | $+1$ | 0 | 数 mm の Al |
| γ | 高エネルギーの光子 | 0 | 0 | 鉛が必要 |

核反応式では必ず**保存**：両辺で $A$ の和と $Z$ の和が等しい。未知の粒子や放出される中性子の数はこれで求める。

## 半減期
:::fig decay

$$N = N_0\left(\tfrac12\right)^{t/T}$$ $T$ 後：半分、$2T$：1/4、$3T$：1/8。放射能（毎秒の崩壊数）∝ $N$ なので同じように半減。炭素14（$T = 5730$ 年）年代測定：残存率 → 年代。

## 質量とエネルギー
$E = mc^2$、1 u ≈ 931 MeV。**質量欠損**：原子核はばらばらの核子より**軽い**。差 × $c^2$ が結合エネルギー。反応で放出されるエネルギー $= (\text{前の質量} - \text{後の質量})c^2$。
- **核分裂**：$^{235}$U + n → 2つの破片 ＋ 中性子 2〜3 個 ＋ 約 200 MeV → 連鎖反応（原子炉、爆弾）。
- **核融合**：軽い核が合体（太陽：4 ¹H → ⁴He）。反発を乗り越えるため超高温が必要。
核子1個あたりの結合エネルギーは鉄付近で最大：重い核の分裂も軽い核の融合もそこへ向かい、エネルギーを放出する。`,
    },
    exam: {
      en: ['Balance a fission or decay equation: find the unknown nuclide or the number of neutrons released (block V, most years).', 'Half-life: fraction remaining after $t$, or the time for activity to fall to 1/8.', 'Energy of a photon from a jump between given levels; which series is visible; energy released from a mass defect in MeV.'],
      ja: ['核分裂や崩壊の式を合わせる：未知の核種や放出される中性子の数（大問 V、ほぼ毎年）。', '半減期：$t$ 後の残存率、放射能が 1/8 になるまでの時間。', '与えられた準位間の遷移で出る光子のエネルギー、可視光になる系列、質量欠損から放出エネルギー（MeV）。'],
    },
    traps: {
      en: ['β⁻ decay **raises** $Z$ by one (a neutron becomes a proton); $A$ is unchanged.', 'Energy levels are negative; a jump **down** emits a photon, a jump up absorbs one. $E = 0$ means the electron has escaped.', 'After three half-lives 1/8 remains, **not** "3 × ½".'],
      ja: ['β⁻ 崩壊では $Z$ が1**増える**（中性子が陽子になる）。$A$ は不変。', 'エネルギー準位は負。**下へ**の遷移で光子を放出、上への遷移で吸収。$E = 0$ は電子が飛び出した状態。', '半減期3回後に残るのは 1/8。「3 × ½」では**ない**。'],
    },
    followups: {
      en: ['Why are atomic spectra lines and not continuous?', 'Show how to balance a uranium fission equation and count the neutrons.', 'Explain mass defect and binding energy with the helium nucleus.', 'Why does the Balmer series fall in the visible range?'],
      ja: ['原子のスペクトルが連続でなく線になるのはなぜ？', 'ウランの核分裂の式を合わせて中性子の数を数える方法を見せて。', 'ヘリウム原子核で質量欠損と結合エネルギーを説明して。', 'バルマー系列が可視光になるのはなぜ？'],
    },
  },
  {
    id: 'elementary-particles',
    core: {
      en: 'Protons and neutrons are not fundamental: each is three quarks (proton = uud, neutron = udd) with charges +⅔ and −⅓. Electrons and neutrinos are leptons, which are fundamental. Four forces do all the work — strong (glues quarks and nuclei), electromagnetic, weak (β decay), gravity — each carried by its own particle.',
      ja: '陽子と中性子は基本粒子ではない：それぞれクォーク3個（陽子 = uud、中性子 = udd）で、電荷は +⅔ と −⅓。電子とニュートリノはレプトンで、これは基本粒子。4つの力がすべてを担う — 強い力（クォークと原子核を結ぶ）、電磁気力、弱い力（β崩壊）、重力 — それぞれを媒介する粒子がある。',
    },
    body: {
      en: r`## The particle zoo, simplified
| family | members | charge | fundamental? |
|---|---|---|---|
| quarks | up (u) $+\tfrac23 e$, down (d) $-\tfrac13 e$ (+ heavier c, s, t, b) | fractional | yes |
| leptons | electron $-e$, electron-neutrino $0$ (+ μ, τ and their neutrinos) | integer or 0 | yes |
| hadrons | made of quarks: **baryons** (3 quarks: p, n), **mesons** (quark + antiquark: π) | integer | no |

Check: proton = uud → $\tfrac23 + \tfrac23 - \tfrac13 = +1$; neutron = udd → $\tfrac23 - \tfrac13 - \tfrac13 = 0$.
Every particle has an antiparticle with opposite charge (positron $e^+$, antiproton). Particle + antiparticle annihilate into photons; energy can create pairs ($E = 2mc^2$ minimum).

## Four fundamental forces
| force | acts on | range | carrier | role |
|---|---|---|---|---|
| strong | quarks (and via them nucleons) | $\sim10^{-15}$ m | gluon | binds nuclei against proton repulsion |
| electromagnetic | charges | infinite ($1/r^2$) | photon | atoms, chemistry, light |
| weak | quarks and leptons | $\sim10^{-18}$ m | W, Z bosons | β decay: d → u + e⁻ + ν̄ |
| gravity | everything with energy | infinite ($1/r^2$) | (graviton, hypothetical) | planets, stars |

Strength inside a nucleus: strong ≫ electromagnetic ≫ weak ≫ gravity.

## Why this shows up on the EJU
Block V occasionally asks: the quark composition/charge of a proton or neutron, which particles are leptons, what β decay is at the quark level (a d quark turns into a u quark), or which force is responsible for holding the nucleus together / for β decay.

## Neutrinos
Nearly massless, neutral, interact only via the weak force → pass through the Earth almost freely. Detected in Kamiokande/Super-Kamiokande (Japan) — a favourite Japanese-context fact.`,
      ja: r`## 素粒子の整理
| 分類 | メンバー | 電荷 | 基本粒子？ |
|---|---|---|---|
| クォーク | アップ (u) $+\tfrac23 e$、ダウン (d) $-\tfrac13 e$（＋重い c, s, t, b） | 分数 | はい |
| レプトン | 電子 $-e$、電子ニュートリノ $0$（＋μ、τ とそのニュートリノ） | 整数か 0 | はい |
| ハドロン | クォークからなる：**バリオン**（クォーク3個：p, n）、**中間子**（クォーク＋反クォーク：π） | 整数 | いいえ |

確認：陽子 = uud → $\tfrac23 + \tfrac23 - \tfrac13 = +1$、中性子 = udd → $\tfrac23 - \tfrac13 - \tfrac13 = 0$。
すべての粒子には電荷が逆の反粒子がある（陽電子 $e^+$、反陽子）。粒子と反粒子は対消滅して光子になり、エネルギーから対生成もできる（最低 $E = 2mc^2$）。

## 4つの基本的な力
| 力 | はたらく対象 | 到達距離 | 媒介粒子 | 役割 |
|---|---|---|---|---|
| 強い力 | クォーク（それを通して核子） | $\sim10^{-15}$ m | グルーオン | 陽子の反発に打ち勝って原子核を結ぶ |
| 電磁気力 | 電荷 | 無限（$1/r^2$） | 光子 | 原子、化学、光 |
| 弱い力 | クォークとレプトン | $\sim10^{-18}$ m | W、Z ボソン | β崩壊：d → u + e⁻ + ν̄ |
| 重力 | エネルギーをもつすべて | 無限（$1/r^2$） | （重力子、仮説） | 惑星、恒星 |

原子核の中での強さ：強い力 ≫ 電磁気力 ≫ 弱い力 ≫ 重力。

## EJUでの出方
大問 V でときどき：陽子・中性子のクォーク構成と電荷、レプトンはどれか、クォークのレベルでのβ崩壊（d クォークが u クォークに変わる）、原子核を結びつける力・β崩壊を起こす力はどれか。

## ニュートリノ
質量はほぼ0、中性、弱い力でしか相互作用しない → 地球をほぼ素通り。カミオカンデ・スーパーカミオカンデ（日本）で検出 — 日本に関係する定番の知識。`,
    },
    exam: {
      en: ['Charge of a quark combination, or which combination makes a proton/neutron (block V).', 'Which force binds the nucleus / causes β decay / is carried by the photon.', 'Which of the listed particles are leptons / are not fundamental.'],
      ja: ['クォークの組み合わせの電荷、陽子・中性子をつくる組み合わせ（大問 V）。', '原子核を結びつける力・β崩壊を起こす力・光子が媒介する力はどれか。', '挙げられた粒子のうちレプトンはどれか、基本粒子でないのはどれか。'],
    },
    traps: {
      en: ['A quark charge is a fraction of $e$, but free particles always carry whole multiples of $e$ — quarks never appear alone.', 'Protons and neutrons are **not** elementary; electrons **are**.', 'β decay is the **weak** force, not the strong or electromagnetic force.'],
      ja: ['クォークの電荷は $e$ の分数だが、単独で存在する粒子の電荷は必ず $e$ の整数倍 — クォークは単独では現れない。', '陽子と中性子は基本粒子では**ない**。電子は基本粒子で**ある**。', 'β崩壊は**弱い力**によるもので、強い力や電磁気力ではない。'],
    },
    followups: {
      en: ['Explain β decay at the quark level.', 'Why does the strong force need to exist inside a nucleus?', 'What makes a particle "fundamental"?', 'Give me a quick quiz on quark charges.'],
      ja: ['クォークのレベルでβ崩壊を説明して。', '原子核の中に強い力が必要なのはなぜ？', '粒子が「基本粒子」であるとはどういうこと？', 'クォークの電荷のミニテストを出して。'],
    },
  },
];

const notes: SubjectNotes = {
  subject: 'physics',
  tree: TREES.physics,
  notes: Object.fromEntries(N.map((n) => [n.id, n])),
};
export default notes;
