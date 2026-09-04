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
];

const notes: SubjectNotes = {
  subject: 'physics',
  tree: TREES.physics,
  notes: Object.fromEntries(N.map((n) => [n.id, n])),
};
export default notes;
