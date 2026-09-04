import type { SubjectNotes, Note } from './types';
import { TREES } from './index';

// Bodies use String.raw so LaTeX backslashes survive. Never put ` or ${ inside.
const r = String.raw;

const N: Note[] = [
  // ───────────────────────────── NUMBERS AND EXPRESSIONS ───────────────────
  {
    id: 'expansion-factoring',
    core: {
      en: 'Expanding multiplies brackets out; factorising is the same thing backwards. Every trick is one of five patterns, so learn the five shapes and look for them.',
      ja: '展開はカッコを外すこと、因数分解はその逆。使う公式は5つの「形」だけなので、形を覚えて探す。',
    },
    body: {
      en: r`## The five shapes (both directions)
| expanded | factorised |
|---|---|
| $a^2 + 2ab + b^2$ | $(a+b)^2$ |
| $a^2 - b^2$ | $(a+b)(a-b)$ |
| $x^2 + (p+q)x + pq$ | $(x+p)(x+q)$ |
| $acx^2 + (ad+bc)x + bd$ | $(ax+b)(cx+d)$ (cross method) |
| $a^3 \pm b^3$ | $(a \pm b)(a^2 \mp ab + b^2)$ |

## How to factorise anything
1. Take out a **common factor** first ($2x^2+4x = 2x(x+2)$).
2. Two terms → difference of squares or cubes.
3. Three terms → find $p, q$ with $p+q =$ middle, $pq =$ last; if the $x^2$ coefficient is not 1, use the cross method.
4. Four or more terms → group in pairs, or treat one letter as "the" variable and the others as numbers.

> Check by expanding again. Thirty seconds of checking saves a lost mark.

## Substitution trick
If an expression repeats, name it: in $(x^2+x)^2 - 5(x^2+x) + 6$, let $t = x^2 + x$ → $t^2 - 5t + 6 = (t-2)(t-3)$, then put $x$ back.`,
      ja: r`## 5つの形（両方向に使う）
| 展開 | 因数分解 |
|---|---|
| $a^2 + 2ab + b^2$ | $(a+b)^2$ |
| $a^2 - b^2$ | $(a+b)(a-b)$ |
| $x^2 + (p+q)x + pq$ | $(x+p)(x+q)$ |
| $acx^2 + (ad+bc)x + bd$ | $(ax+b)(cx+d)$（たすき掛け） |
| $a^3 \pm b^3$ | $(a \pm b)(a^2 \mp ab + b^2)$ |

## 因数分解の手順
1. まず**共通因数**をくくり出す（$2x^2+4x = 2x(x+2)$）。
2. 2項 → 平方の差・立方の和差。
3. 3項 → 足して真ん中、かけて最後になる $p, q$ を探す。$x^2$ の係数が1でなければたすき掛け。
4. 4項以上 → 2つずつ組む、または1つの文字について整理する。

> 最後に展開して確かめる。30秒で1問分守れる。

## おきかえ
同じかたまりが繰り返すなら名前をつける：$(x^2+x)^2 - 5(x^2+x) + 6$ で $t = x^2 + x$ とおくと $t^2 - 5t + 6 = (t-2)(t-3)$。最後に $x$ に戻す。`,
    },
    exam: {
      en: ['Factorise a 2-letter or 3-letter expression, then use it to solve or simplify.', 'Expand and read off one coefficient (often combined with the binomial theorem).', 'Substitute $t$ for a repeated block, then factorise.'],
      ja: ['2〜3文字の式を因数分解し、その後の計算に使う。', '展開して特定の係数だけ答える（二項定理と一緒に出ることも）。', 'かたまりを $t$ とおいて因数分解。'],
    },
    traps: {
      en: ['$(a+b)^2 \\ne a^2+b^2$. The middle term $2ab$ is the whole point.', 'Forgetting the common factor first makes the cross method fail.', 'A "complete" factorisation continues until nothing factorises further.'],
      ja: ['$(a+b)^2 \\ne a^2+b^2$。真ん中の $2ab$ を忘れない。', '共通因数を先に出さないとたすき掛けが決まらない。', '「これ以上分解できない」まで続けるのが因数分解。'],
    },
    followups: {
      en: ['Show me the cross method step by step on $6x^2+7x-3$.', 'How do I factorise when there are two letters, like $x^2+3xy+2y^2$?', 'Quiz me with five quick factorisations.'],
      ja: ['$6x^2+7x-3$ のたすき掛けを手順ごとに見せて。', '$x^2+3xy+2y^2$ のような2文字の因数分解のコツは？', '因数分解のミニテストを5問出して。'],
    },
  },
  {
    id: 'real-numbers',
    core: {
      en: 'Square roots and absolute values are both "size" ideas: $\\sqrt{a^2} = |a|$, never just $a$. Clean fractions by removing roots from the bottom.',
      ja: '平方根も絶対値も「大きさ」の話：$\\sqrt{a^2} = |a|$ であって $a$ ではない。分母に根号があれば有理化して整える。',
    },
    body: {
      en: r`## Roots
- $\sqrt{a}\sqrt{b} = \sqrt{ab}$, $\dfrac{\sqrt a}{\sqrt b} = \sqrt{\dfrac ab}$ (for $a,b \ge 0$). Simplify: $\sqrt{18} = 3\sqrt2$.
- **Rationalise**: $\dfrac{1}{\sqrt3+1} = \dfrac{\sqrt3-1}{(\sqrt3+1)(\sqrt3-1)} = \dfrac{\sqrt3-1}{2}$. Multiply top and bottom by the *conjugate* (same numbers, opposite sign).
- Double root: $\sqrt{a+b+2\sqrt{ab}} = \sqrt a + \sqrt b$ (find two numbers with sum $a+b$, product $ab$).

## Integer and fractional parts
For $x = 2+\sqrt3 \approx 3.73$: integer part $a = 3$, fractional part $b = x - a = \sqrt3 - 1$. EJU loves asking for $b^2 + \dfrac1b$ afterwards.

## Absolute value
$|x|$ = distance from 0. Remove it by cases: $|x-2| = x-2$ if $x \ge 2$, and $-(x-2)$ if $x<2$.

> $|x| < 3 \iff -3 < x < 3$; $|x| > 3 \iff x < -3$ or $x > 3$.

## Symmetric expressions
If you know $x + y$ and $xy$, you know everything: $x^2+y^2 = (x+y)^2 - 2xy$, $x^3+y^3 = (x+y)^3 - 3xy(x+y)$.`,
      ja: r`## 根号
- $\sqrt{a}\sqrt{b} = \sqrt{ab}$、$\dfrac{\sqrt a}{\sqrt b} = \sqrt{\dfrac ab}$（$a,b \ge 0$）。整理：$\sqrt{18} = 3\sqrt2$。
- **有理化**：$\dfrac{1}{\sqrt3+1} = \dfrac{\sqrt3-1}{(\sqrt3+1)(\sqrt3-1)} = \dfrac{\sqrt3-1}{2}$。分母の符号を変えた式（共役）を上下にかける。
- 二重根号：$\sqrt{a+b+2\sqrt{ab}} = \sqrt a + \sqrt b$（和が $a+b$、積が $ab$ の2数を探す）。

## 整数部分・小数部分
$x = 2+\sqrt3 \approx 3.73$ なら整数部分 $a = 3$、小数部分 $b = x - a = \sqrt3 - 1$。そのあと $b^2 + \dfrac1b$ を聞くのがEJUの定番。

## 絶対値
$|x|$ は0からの距離。場合分けで外す：$x \ge 2$ なら $|x-2| = x-2$、$x<2$ なら $-(x-2)$。

> $|x| < 3 \iff -3 < x < 3$、$|x| > 3 \iff x < -3$ または $x > 3$。

## 対称式
$x + y$ と $xy$ がわかれば全部わかる：$x^2+y^2 = (x+y)^2 - 2xy$、$x^3+y^3 = (x+y)^3 - 3xy(x+y)$。`,
    },
    exam: {
      en: ['Rationalise, then find integer/fractional parts and a value like $b^2+1/b$.', 'Compute $x^2+y^2$ or $x^3+y^3$ from $x+y$ and $xy$ (with $x = 2+\\sqrt3$, $y = 2-\\sqrt3$).', 'Solve $|x-1| + |x-3| = 4$ by cases.'],
      ja: ['有理化 → 整数部分・小数部分 → $b^2+1/b$ の値。', '$x = 2+\\sqrt3$、$y = 2-\\sqrt3$ で $x^2+y^2$、$x^3+y^3$ を求める。', '$|x-1| + |x-3| = 4$ を場合分けで解く。'],
    },
    traps: {
      en: ['$\\sqrt{(-3)^2} = 3$, not $-3$.', 'The fractional part is $x - \\lfloor x \\rfloor$; you must estimate $\\sqrt3 \\approx 1.73$ correctly first.', 'When removing $|\\ |$ with cases, check each answer lies in its own case.'],
      ja: ['$\\sqrt{(-3)^2} = 3$ であって $-3$ ではない。', '小数部分は $x - (\\text{整数部分})$。まず $\\sqrt3 \\approx 1.73$ の見積もりを正しく。', '絶対値を場合分けで外したら、答えがその場合の範囲に入っているか確認。'],
    },
    followups: {
      en: ['Why does multiplying by the conjugate remove the root?', 'Walk me through a double-root example.', 'Quiz me on integer and fractional parts.'],
      ja: ['共役をかけると根号が消えるのはなぜ？', '二重根号の例を一緒に解いて。', '整数部分・小数部分のミニテストを出して。'],
    },
  },
  {
    id: 'equations-inequalities',
    core: {
      en: 'A quadratic $ax^2+bx+c=0$ has as many real solutions as the sign of $D = b^2-4ac$ says: positive → 2, zero → 1, negative → 0. Inequalities are equations plus a sign check.',
      ja: '2次方程式 $ax^2+bx+c=0$ の実数解の個数は判別式 $D = b^2-4ac$ の符号で決まる：正なら2個、0なら1個、負なら0個。不等式は方程式＋符号の確認。',
    },
    body: {
      en: r`## Quadratic formula and discriminant
$$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}, \qquad D = b^2 - 4ac$$
If $b = 2b'$ (even middle coefficient): $x = \dfrac{-b' \pm \sqrt{b'^2 - ac}}{a}$ — fewer big numbers.

| $D$ | real solutions |
|---|---|
| $D>0$ | two different |
| $D=0$ | one (repeated) |
| $D<0$ | none (two complex) |

Try factorising first; use the formula only if it does not factorise.

## Linear inequalities
Same as equations, **except** dividing or multiplying by a negative flips the sign: $-2x < 6 \Rightarrow x > -3$.
Simultaneous inequalities: solve each, then take the **overlap** on a number line.

## Equations with absolute value
$|x - 1| = 2x$: split at $x = 1$, solve each case, keep only solutions inside their case.`,
      ja: r`## 解の公式と判別式
$$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}, \qquad D = b^2 - 4ac$$
$b = 2b'$（真ん中が偶数）なら $x = \dfrac{-b' \pm \sqrt{b'^2 - ac}}{a}$ で計算が軽い。

| $D$ | 実数解 |
|---|---|
| $D>0$ | 異なる2つ |
| $D=0$ | 1つ（重解） |
| $D<0$ | なし（虚数解2つ） |

まず因数分解を試し、できないときだけ公式。

## 1次不等式
方程式と同じ。ただし負の数でかけ算・割り算すると不等号が**逆**になる：$-2x < 6 \Rightarrow x > -3$。
連立不等式：それぞれ解いて、数直線で**共通部分**をとる。

## 絶対値つき方程式
$|x - 1| = 2x$：$x = 1$ で分けて各場合を解き、その場合の範囲に入る解だけ残す。`,
    },
    exam: {
      en: ['Find the parameter range so a quadratic has two distinct real roots ($D>0$).', 'Solve simultaneous linear inequalities and count the integers in the overlap.', 'Solve an absolute-value equation or inequality by cases.'],
      ja: ['異なる2つの実数解をもつ条件（$D>0$）から定数の範囲を求める。', '連立不等式を解き、共通範囲の整数の個数を数える。', '絶対値の方程式・不等式を場合分けで解く。'],
    },
    traps: {
      en: ['Dividing an inequality by a negative without flipping the sign.', '"Real solutions" needs $D \\ge 0$; "two different real solutions" needs $D > 0$ strictly.', 'If the $x^2$ coefficient contains a parameter, $a = 0$ makes it linear — treat that case separately.'],
      ja: ['負の数で割ったのに不等号を逆にしない。', '「実数解をもつ」は $D \\ge 0$、「異なる2つ」は $D > 0$。等号の有無を読む。', '$x^2$ の係数に定数が入るなら $a = 0$ のとき1次方程式になる。別扱い。'],
    },
    followups: {
      en: ['Why does the sign flip when dividing by a negative number?', 'Show me where the quadratic formula comes from.', 'Give me three $D$ problems with parameters.'],
      ja: ['負で割ると不等号が逆になるのはなぜ？', '解の公式の導き方を見せて。', '定数入りの判別式の問題を3問出して。'],
    },
  },
  {
    id: 'sets-logic',
    core: {
      en: '"$p \\Rightarrow q$" means every $p$-thing is a $q$-thing: $p$ is inside $q$. Then $p$ is sufficient for $q$, and $q$ is necessary for $p$. Draw the circles.',
      ja: '「$p \\Rightarrow q$」は $p$ のものは全部 $q$ でもある、つまり $p$ は $q$ の内側。このとき $p$ は $q$ の十分条件、$q$ は $p$ の必要条件。円を描けば迷わない。',
    },
    body: {
      en: r`## Sets
$A \cup B$ (union: in either), $A \cap B$ (intersection: in both), $\overline{A}$ (complement: not in $A$).
De Morgan: $\overline{A \cup B} = \overline A \cap \overline B$, $\overline{A \cap B} = \overline A \cup \overline B$.
Counting: $n(A \cup B) = n(A) + n(B) - n(A \cap B)$.

## Necessary and sufficient
| true statement | say |
|---|---|
| $p \Rightarrow q$ | $p$ is **sufficient** for $q$; $q$ is **necessary** for $p$ |
| $p \Rightarrow q$ and $q \Rightarrow p$ | necessary **and** sufficient (equivalent) |

Test: is "$x = 2$" sufficient for "$x^2 = 4$"? Yes ($2^2 = 4$). Necessary? No ($x = -2$ also works). So $x=2$ is sufficient but not necessary.

## Contrapositive and negation
- Contrapositive of $p \Rightarrow q$ is $\overline q \Rightarrow \overline p$; it is **always** equally true. Use it when the direct proof is awkward.
- Negation flips "all" ↔ "some": not "all $x$ satisfy $P$" = "some $x$ does not satisfy $P$". Negation of "$x>0$ and $y>0$" is "$x \le 0$ or $y \le 0$".

> Counterexample: one example that satisfies $p$ but not $q$ proves "$p \Rightarrow q$" false.`,
      ja: r`## 集合
$A \cup B$（和集合：どちらかに入る）、$A \cap B$（共通部分：両方に入る）、$\overline{A}$（補集合：$A$ に入らない）。
ド・モルガン：$\overline{A \cup B} = \overline A \cap \overline B$、$\overline{A \cap B} = \overline A \cup \overline B$。
個数：$n(A \cup B) = n(A) + n(B) - n(A \cap B)$。

## 必要条件・十分条件
| 正しい命題 | 言い方 |
|---|---|
| $p \Rightarrow q$ | $p$ は $q$ の**十分**条件、$q$ は $p$ の**必要**条件 |
| $p \Rightarrow q$ かつ $q \Rightarrow p$ | 必要**十分**条件（同値） |

例：「$x = 2$」は「$x^2 = 4$」の十分条件？ はい（$2^2 = 4$）。必要条件？ いいえ（$x = -2$ でも成り立つ）。よって十分条件だが必要条件ではない。

## 対偶と否定
- $p \Rightarrow q$ の対偶は $\overline q \Rightarrow \overline p$。真偽は**必ず一致**。直接示しにくいときに使う。
- 否定は「すべて」↔「ある」を入れ替える。「$x>0$ かつ $y>0$」の否定は「$x \le 0$ または $y \le 0$」。

> 反例：$p$ を満たすのに $q$ を満たさない例が1つあれば「$p \Rightarrow q$」は偽。`,
    },
    exam: {
      en: ['Choose "necessary / sufficient / both / neither" for a pair of conditions.', 'Count elements with $n(A \\cup B)$ or De Morgan.', 'Prove by contrapositive: "if $n^2$ is even then $n$ is even".'],
      ja: ['2つの条件について「必要・十分・必要十分・どちらでもない」を選ぶ。', '$n(A \\cup B)$ やド・モルガンで個数を数える。', '対偶で証明：「$n^2$ が偶数なら $n$ は偶数」。'],
    },
    traps: {
      en: ['Mixing up which side is "necessary": the bigger set is the necessary condition.', 'Negating "and" gives "or" (and vice versa).', 'The converse $q \\Rightarrow p$ is NOT automatically true.'],
      ja: ['必要条件は「大きい方の集合」。向きを取り違えない。', '「かつ」の否定は「または」（逆も）。', '逆 $q \\Rightarrow p$ は自動的には成り立たない。'],
    },
    followups: {
      en: ['Explain necessary vs sufficient with a Venn diagram.', 'Why is the contrapositive always equivalent?', 'Quiz me on negations of statements.'],
      ja: ['必要条件と十分条件をベン図で説明して。', '対偶が必ず同値なのはなぜ？', '命題の否定のミニテストを出して。'],
    },
  },

  // ───────────────────────────── QUADRATIC FUNCTIONS ───────────────────
  {
    id: 'quadratic-graphs',
    core: {
      en: 'Every parabola is $y = a(x-p)^2 + q$: vertex at $(p, q)$, opens up if $a>0$. Complete the square to find $p, q$, then the max/min on any interval is at the vertex or at an endpoint.',
      ja: '放物線はすべて $y = a(x-p)^2 + q$ の形：頂点 $(p, q)$、$a>0$ なら下に凸。平方完成で $p, q$ を出し、区間の最大最小は「頂点か端」で決まる。',
    },
    body: {
      en: r`## Completing the square
$y = 2x^2 - 8x + 5 = 2(x^2 - 4x) + 5 = 2\{(x-2)^2 - 4\} + 5 = 2(x-2)^2 - 3$.
Vertex $(2, -3)$, axis $x = 2$. Rule: half the $x$ coefficient, square it, subtract it back.

## Moving graphs
| move | new equation |
|---|---|
| right by $p$, up by $q$ | replace $x \to x-p$, $y \to y-q$ |
| flip in $x$-axis | $y \to -y$ |
| flip in $y$-axis | $x \to -x$ |

## Max / min on an interval $a \le x \le b$
1. Find the vertex $x = p$.
2. If $p$ is inside the interval, the vertex gives one extreme; the **farther endpoint** gives the other.
3. If $p$ is outside, both extremes are at the endpoints.

When the axis contains a parameter, split into cases: axis left of the interval / inside / right of it.

## Three forms
- Standard $ax^2+bx+c$: reads the $y$-intercept $c$.
- Vertex $a(x-p)^2+q$: reads the vertex.
- Factored $a(x-\alpha)(x-\beta)$: reads the $x$-intercepts; the axis is $x = \dfrac{\alpha+\beta}{2}$.`,
      ja: r`## 平方完成
$y = 2x^2 - 8x + 5 = 2(x^2 - 4x) + 5 = 2\{(x-2)^2 - 4\} + 5 = 2(x-2)^2 - 3$。
頂点 $(2, -3)$、軸 $x = 2$。手順：$x$ の係数を半分にして2乗し、その分を引いて戻す。

## 平行移動・対称移動
| 移動 | 式の書きかえ |
|---|---|
| $x$ 方向に $p$、$y$ 方向に $q$ | $x \to x-p$、$y \to y-q$ |
| $x$ 軸に関して対称 | $y \to -y$ |
| $y$ 軸に関して対称 | $x \to -x$ |

## 区間 $a \le x \le b$ での最大最小
1. 頂点 $x = p$ を求める。
2. $p$ が区間内なら頂点が一方の極値、**遠い方の端**がもう一方。
3. $p$ が区間外なら両方とも端。

軸に文字が入るときは「軸が区間の左／中／右」で場合分け。

## 3つの形
- 一般形 $ax^2+bx+c$：$y$ 切片 $c$ が読める。
- 頂点形 $a(x-p)^2+q$：頂点が読める。
- 因数分解形 $a(x-\alpha)(x-\beta)$：$x$ 切片が読め、軸は $x = \dfrac{\alpha+\beta}{2}$。`,
    },
    exam: {
      en: ['Complete the square, then give the max and min on a given interval.', 'Axis with a parameter: find the minimum as a function of $a$ (case split).', 'Find the equation of a parabola through three points or with a given vertex.'],
      ja: ['平方完成して、区間での最大値・最小値を答える。', '軸に文字：最小値を $a$ の式で表す（場合分け）。', '3点を通る、または頂点が与えられた放物線の式を求める。'],
    },
    traps: {
      en: ['When completing the square with $a \\ne 1$, multiply the subtracted square by $a$ too.', 'The farther endpoint, not the nearer, gives the other extreme.', 'Moving right by $p$ means $(x - p)$, with a minus.'],
      ja: ['$a \\ne 1$ の平方完成では、引いた分にも $a$ をかける。', '頂点と反対側の極値は「遠い方の端」。', '右に $p$ 動かすと $(x - p)$。マイナスになる。'],
    },
    followups: {
      en: ['Show the three cases for an axis with a parameter on one example.', 'Why does the vertex form work for translations?', 'Quiz me: find the vertex of five quadratics fast.'],
      ja: ['軸に文字がある場合分けを1つの例で見せて。', '頂点形で平行移動が読める理由は？', '5つの2次関数の頂点を速く求めるミニテストを出して。'],
    },
  },
  {
    id: 'quadratic-inequalities',
    core: {
      en: 'Solve $ax^2+bx+c>0$ by drawing the parabola: find where it crosses the $x$-axis, then read which parts are above zero. Root-position problems are the same picture with three checks: $D$, axis, and the sign of $f$ at the boundary.',
      ja: '$ax^2+bx+c>0$ は放物線を描いて解く：$x$ 軸との交点を求め、0より上の部分を読む。解の配置は同じ絵で「判別式・軸・端の値の符号」の3つを確認するだけ。',
    },
    body: {
      en: r`## Quadratic inequalities
For $a>0$ with roots $\alpha < \beta$:
| inequality | answer |
|---|---|
| $a(x-\alpha)(x-\beta) > 0$ | $x < \alpha$ or $x > \beta$ (outside) |
| $a(x-\alpha)(x-\beta) < 0$ | $\alpha < x < \beta$ (between) |

If $a<0$, multiply by $-1$ first (and flip the sign) so the parabola opens up.
No real roots ($D<0$) and $a>0$: $f(x)>0$ for **all** $x$; $f(x)<0$ never.

## "Always positive" conditions
$ax^2+bx+c > 0$ for all $x$ $\iff a>0$ and $D<0$.

## Position of roots (解の配置)
To force both roots of $f(x)=x^2+bx+c$ to be greater than $k$, check three things:
1. $D \ge 0$ (roots exist),
2. axis $-\dfrac b2 > k$,
3. $f(k) > 0$ (the parabola is above zero at $x = k$).
For "one root above $k$ and one below": only $f(k) < 0$ is needed.

> Draw the parabola every time. The three conditions are just what the picture must look like.`,
      ja: r`## 2次不等式
$a>0$、解 $\alpha < \beta$ のとき：
| 不等式 | 答え |
|---|---|
| $a(x-\alpha)(x-\beta) > 0$ | $x < \alpha$ または $x > \beta$（外側） |
| $a(x-\alpha)(x-\beta) < 0$ | $\alpha < x < \beta$（内側） |

$a<0$ なら先に $-1$ をかけて（不等号を逆にして）下に凸にする。
実数解なし（$D<0$）で $a>0$：$f(x)>0$ は**すべての** $x$、$f(x)<0$ は解なし。

## つねに正になる条件
すべての $x$ で $ax^2+bx+c > 0$ $\iff a>0$ かつ $D<0$。

## 解の配置
$f(x)=x^2+bx+c$ の2解がともに $k$ より大きい条件は3つ：
1. $D \ge 0$（解が存在）
2. 軸 $-\dfrac b2 > k$
3. $f(k) > 0$（$x = k$ で放物線が0より上）
「$k$ をはさむ」なら $f(k) < 0$ だけでよい。

> 毎回放物線を描く。3条件は「絵がその形になる条件」にすぎない。`,
    },
    exam: {
      en: ['Solve a quadratic inequality and count integer solutions.', 'Find $a$ so that $ax^2 + 2x + a > 0$ for all $x$.', 'Both roots between 0 and 2: state the three conditions and solve for the parameter.'],
      ja: ['2次不等式を解き、整数解の個数を数える。', 'すべての $x$ で $ax^2 + 2x + a > 0$ となる $a$ の範囲。', '2解がともに0と2の間：3条件を書いて定数の範囲を求める。'],
    },
    traps: {
      en: ['"Greater than" with $a>0$ is the OUTSIDE region, not between the roots.', 'Forgetting $D \\ge 0$ in root-position problems (axis and $f(k)$ alone are not enough).', '"For all $x$" with a parameter as the $x^2$ coefficient: $a = 0$ is a separate (linear) case.'],
      ja: ['$a>0$ で「$>0$」は解の**外側**。内側と混同しない。', '解の配置で $D \\ge 0$ を忘れる（軸と $f(k)$ だけでは不足）。', '「すべての $x$」で $x^2$ の係数が文字なら $a = 0$（1次）を別に扱う。'],
    },
    followups: {
      en: ['Why are exactly those three conditions enough for root positions?', 'Show me the picture for one root above and one below $k$.', 'Give me three inequality problems with integer-solution counting.'],
      ja: ['解の配置でその3条件が十分なのはなぜ？', '「$k$ をはさむ」場合の絵を見せて。', '整数解の個数を数える不等式の問題を3問出して。'],
    },
  },

  // ───────────────────────────── FIGURES AND MEASUREMENT ───────────────────
  {
    id: 'trig-ratios',
    core: {
      en: 'For an angle $\\theta$, put a point on the unit circle: its $x$-coordinate is $\\cos\\theta$, its $y$-coordinate is $\\sin\\theta$, and $\\tan\\theta = y/x$ is the gradient. Every identity follows from that picture.',
      ja: '角 $\\theta$ に対して単位円上に点をとる：$x$ 座標が $\\cos\\theta$、$y$ 座標が $\\sin\\theta$、$\\tan\\theta = y/x$ は傾き。公式は全部この絵から出る。',
    },
    body: {
      en: r`## Values to know cold
| $\theta$ | $0°$ | $30°$ | $45°$ | $60°$ | $90°$ | $120°$ | $135°$ | $150°$ | $180°$ |
|---|---|---|---|---|---|---|---|---|---|
| $\sin$ | 0 | $\frac12$ | $\frac{\sqrt2}{2}$ | $\frac{\sqrt3}{2}$ | 1 | $\frac{\sqrt3}{2}$ | $\frac{\sqrt2}{2}$ | $\frac12$ | 0 |
| $\cos$ | 1 | $\frac{\sqrt3}{2}$ | $\frac{\sqrt2}{2}$ | $\frac12$ | 0 | $-\frac12$ | $-\frac{\sqrt2}{2}$ | $-\frac{\sqrt3}{2}$ | $-1$ |

Memory: $\sin$ of $30°, 45°, 60°$ is $\frac{\sqrt1}{2}, \frac{\sqrt2}{2}, \frac{\sqrt3}{2}$.

## The three relations
$$\sin^2\theta + \cos^2\theta = 1, \qquad \tan\theta = \frac{\sin\theta}{\cos\theta}, \qquad 1 + \tan^2\theta = \frac{1}{\cos^2\theta}$$
Given one ratio, get the others: from $\sin\theta = \frac35$ and $90° < \theta < 180°$, $\cos\theta = -\frac45$ (negative because $x<0$ in that range), $\tan\theta = -\frac34$.

## Related angles
| angle | $\sin$ | $\cos$ |
|---|---|---|
| $180° - \theta$ | $\sin\theta$ | $-\cos\theta$ |
| $90° - \theta$ | $\cos\theta$ | $\sin\theta$ |

> In a right triangle: $\sin = \dfrac{\text{opposite}}{\text{hypotenuse}}$, $\cos = \dfrac{\text{adjacent}}{\text{hypotenuse}}$, $\tan = \dfrac{\text{opposite}}{\text{adjacent}}$. Same numbers, different picture.`,
      ja: r`## 覚える値
| $\theta$ | $0°$ | $30°$ | $45°$ | $60°$ | $90°$ | $120°$ | $135°$ | $150°$ | $180°$ |
|---|---|---|---|---|---|---|---|---|---|
| $\sin$ | 0 | $\frac12$ | $\frac{\sqrt2}{2}$ | $\frac{\sqrt3}{2}$ | 1 | $\frac{\sqrt3}{2}$ | $\frac{\sqrt2}{2}$ | $\frac12$ | 0 |
| $\cos$ | 1 | $\frac{\sqrt3}{2}$ | $\frac{\sqrt2}{2}$ | $\frac12$ | 0 | $-\frac12$ | $-\frac{\sqrt2}{2}$ | $-\frac{\sqrt3}{2}$ | $-1$ |

覚え方：$30°, 45°, 60°$ の $\sin$ は $\frac{\sqrt1}{2}, \frac{\sqrt2}{2}, \frac{\sqrt3}{2}$。

## 相互関係（3つ）
$$\sin^2\theta + \cos^2\theta = 1, \qquad \tan\theta = \frac{\sin\theta}{\cos\theta}, \qquad 1 + \tan^2\theta = \frac{1}{\cos^2\theta}$$
1つわかれば残りが出る：$\sin\theta = \frac35$、$90° < \theta < 180°$ なら $\cos\theta = -\frac45$（この範囲は $x<0$ なので負）、$\tan\theta = -\frac34$。

## 関連する角
| 角 | $\sin$ | $\cos$ |
|---|---|---|
| $180° - \theta$ | $\sin\theta$ | $-\cos\theta$ |
| $90° - \theta$ | $\cos\theta$ | $\sin\theta$ |

> 直角三角形では $\sin = \dfrac{対辺}{斜辺}$、$\cos = \dfrac{隣辺}{斜辺}$、$\tan = \dfrac{対辺}{隣辺}$。同じ数を別の絵で見ているだけ。`,
    },
    exam: {
      en: ['Given $\\sin\\theta$ and the quadrant, find $\\cos\\theta$ and $\\tan\\theta$.', 'Simplify expressions with $180° - \\theta$ or $90° - \\theta$.', 'Find $\\sin\\theta\\cos\\theta$ from $\\sin\\theta + \\cos\\theta = \\frac{1}{2}$ (square it).'],
      ja: ['$\\sin\\theta$ と範囲から $\\cos\\theta$、$\\tan\\theta$ を求める。', '$180° - \\theta$、$90° - \\theta$ を含む式を簡単にする。', '$\\sin\\theta + \\cos\\theta = \\frac{1}{2}$ から $\\sin\\theta\\cos\\theta$（2乗する）。'],
    },
    traps: {
      en: ['Sign depends on the quadrant: check where the point sits on the circle before taking a square root.', '$\\cos 120° = -\\frac12$, not $+\\frac12$.', '$\\sin^2\\theta$ means $(\\sin\\theta)^2$, not $\\sin(\\theta^2)$.'],
      ja: ['符号は象限で決まる。平方根をとる前に点の位置を確認。', '$\\cos 120° = -\\frac12$。プラスにしない。', '$\\sin^2\\theta$ は $(\\sin\\theta)^2$ のこと。'],
    },
    followups: {
      en: ['Why is $\\sin^2 + \\cos^2 = 1$? Show me on the circle.', 'How do I remember the signs in each quadrant?', 'Quiz me on the value table.'],
      ja: ['$\\sin^2 + \\cos^2 = 1$ になる理由を単位円で見せて。', '各象限の符号の覚え方は？', '値の表のミニテストを出して。'],
    },
  },
  {
    id: 'sine-cosine-rules',
    core: {
      en: 'Any triangle is solved by two tools: the sine rule links each side to the sine of the opposite angle, the cosine rule is Pythagoras with a correction term. Area is $\\frac12 ab\\sin C$.',
      ja: 'どんな三角形も2つの道具で解ける：正弦定理は「辺と向かいの角の sin」をつなぎ、余弦定理は三平方の定理に補正項をつけたもの。面積は $\\frac12 ab\\sin C$。',
    },
    body: {
      en: r`## Sine rule (with circumradius $R$)
$$\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} = 2R$$
Use when you know an angle and its opposite side, or want $R$.

## Cosine rule
$$a^2 = b^2 + c^2 - 2bc\cos A \qquad\Longleftrightarrow\qquad \cos A = \frac{b^2 + c^2 - a^2}{2bc}$$
Use when you know two sides and the angle between them, or all three sides.
If $\cos A < 0$ the angle is obtuse; $\cos A = 0$ means right angle.

## Area
$$S = \tfrac12 bc\sin A = \tfrac12 ab \sin C, \qquad S = \tfrac12 r(a+b+c) \text{ (inradius } r)$$
Heron: with $s = \frac{a+b+c}{2}$, $S = \sqrt{s(s-a)(s-b)(s-c)}$.

## Typical chain
sides $a, b, c$ → $\cos A$ (cosine rule) → $\sin A = \sqrt{1-\cos^2 A}$ → area → $R = \dfrac{a}{2\sin A}$ and $r = \dfrac{2S}{a+b+c}$.

> Draw the triangle and label the angle **between** the two sides you know.`,
      ja: r`## 正弦定理（外接円の半径 $R$）
$$\frac{a}{\sin A} = \frac{b}{\sin B} = \frac{c}{\sin C} = 2R$$
角とその向かいの辺がわかるとき、または $R$ を求めるときに使う。

## 余弦定理
$$a^2 = b^2 + c^2 - 2bc\cos A \qquad\Longleftrightarrow\qquad \cos A = \frac{b^2 + c^2 - a^2}{2bc}$$
2辺とその間の角、または3辺がわかるときに使う。
$\cos A < 0$ なら鈍角、$\cos A = 0$ なら直角。

## 面積
$$S = \tfrac12 bc\sin A = \tfrac12 ab \sin C, \qquad S = \tfrac12 r(a+b+c) \text{（内接円の半径 } r)$$
ヘロン：$s = \frac{a+b+c}{2}$ として $S = \sqrt{s(s-a)(s-b)(s-c)}$。

## 定番の流れ
3辺 $a, b, c$ → $\cos A$（余弦定理）→ $\sin A = \sqrt{1-\cos^2 A}$ → 面積 → $R = \dfrac{a}{2\sin A}$、$r = \dfrac{2S}{a+b+c}$。

> 三角形を描き、わかっている2辺の**間の角**に印をつける。`,
    },
    exam: {
      en: ['Three sides given: find $\\cos A$, $\\sin A$, the area, $R$ and $r$ in a chain.', 'Two sides and the included angle: find the third side, then another angle.', 'Cyclic quadrilateral: use $\\cos$ of opposite angles ($\\cos D = -\\cos B$) with the cosine rule twice on the diagonal.'],
      ja: ['3辺から $\\cos A$ → $\\sin A$ → 面積 → $R$、$r$ の連鎖。', '2辺とその間の角から第3辺、さらに別の角。', '円に内接する四角形：対角の $\\cos D = -\\cos B$ を使い、対角線に余弦定理を2回。'],
    },
    traps: {
      en: ['The cosine rule angle must be the one between the two sides; otherwise you get nonsense.', '$\\sin A$ from $\\cos A$ is always positive in a triangle ($0° < A < 180°$).', 'Sine rule gives $\\sin B$, and two angles have that sine — decide acute or obtuse from the side lengths.'],
      ja: ['余弦定理の角は2辺の間の角。違う角を使うと意味がない。', '三角形の角では $\\sin A > 0$（$0° < A < 180°$）。', '正弦定理で $\\sin B$ が出ても角は2通り。辺の長さから鋭角か鈍角か決める。'],
    },
    followups: {
      en: ['Where does the cosine rule come from?', 'Walk me through the full chain on a 3-4-5 triangle.', 'Why is $S = \\frac12 r(a+b+c)$?'],
      ja: ['余弦定理はどこから来る？', '3-4-5 の三角形で流れを全部やって。', '$S = \\frac12 r(a+b+c)$ になる理由は？'],
    },
  },
  {
    id: 'plane-geometry',
    core: {
      en: 'Most figure problems are ratios of lengths. Three ratio tools cover almost everything: the angle-bisector theorem, Menelaus/Ceva for lines cutting a triangle, and the power of a point for circles.',
      ja: '図形問題の多くは「長さの比」。比の道具3つでほぼ全部片付く：角の二等分線の定理、三角形を切る直線のメネラウス・チェバ、円の方べきの定理。',
    },
    body: {
      en: r`## Triangle centres
| centre | what it is | fact |
|---|---|---|
| centroid $G$ | medians meet | divides each median $2:1$ |
| circumcentre $O$ | perpendicular bisectors meet | equidistant from vertices; $R$ |
| incentre $I$ | angle bisectors meet | equidistant from sides; $r$ |
| orthocentre $H$ | altitudes meet | — |

## Angle bisector theorem
The bisector from $A$ meets $BC$ at $D$: $BD : DC = AB : AC$.

## Menelaus and Ceva
Line through the sides of $\triangle ABC$ hitting $BC, CA, AB$ (or extensions) at $P, Q, R$:
$$\frac{BP}{PC}\cdot\frac{CQ}{QA}\cdot\frac{AR}{RB} = 1$$
Menelaus = one straight line cutting the triangle; Ceva = three lines through one point. Same formula, go around the triangle in order.

## Circles
- Inscribed angle = half the central angle; angles on the same arc are equal; angle in a semicircle is $90°$.
- Cyclic quadrilateral: opposite angles add to $180°$.
- Tangent ⟂ radius; two tangents from a point are equal.
- **Power of a point**: chords through $P$: $PA \cdot PB = PC \cdot PD$; tangent $PT$: $PT^2 = PA \cdot PB$.

> Look for equal angles first (inscribed angles, tangents); ratios come from similar triangles.`,
      ja: r`## 三角形の中心
| 中心 | 定義 | 性質 |
|---|---|---|
| 重心 $G$ | 中線の交点 | 中線を $2:1$ に分ける |
| 外心 $O$ | 垂直二等分線の交点 | 各頂点から等距離、$R$ |
| 内心 $I$ | 角の二等分線の交点 | 各辺から等距離、$r$ |
| 垂心 $H$ | 垂線の交点 | — |

## 角の二等分線の定理
$A$ の二等分線が $BC$ と $D$ で交わるとき $BD : DC = AB : AC$。

## メネラウス・チェバ
$\triangle ABC$ の辺 $BC, CA, AB$（延長を含む）と $P, Q, R$ で交わるとき
$$\frac{BP}{PC}\cdot\frac{CQ}{QA}\cdot\frac{AR}{RB} = 1$$
メネラウス＝1本の直線が三角形を切る、チェバ＝1点を通る3本。式は同じ、三角形を一周する順にかける。

## 円
- 円周角は中心角の半分。同じ弧の円周角は等しい。半円の円周角は $90°$。
- 内接四角形：対角の和は $180°$。
- 接線 ⟂ 半径。1点から引いた2本の接線は等しい。
- **方べきの定理**：$P$ を通る2弦で $PA \cdot PB = PC \cdot PD$、接線 $PT$ なら $PT^2 = PA \cdot PB$。

> まず等しい角を探す（円周角・接線）。比は相似から出る。`,
    },
    exam: {
      en: ['Find a length ratio with Menelaus or Ceva, then an area ratio.', 'Circle with a tangent and a chord: use power of a point to find a length.', 'Use inscribed-angle facts to find an angle in a cyclic quadrilateral.'],
      ja: ['メネラウス・チェバで長さの比、続いて面積比。', '接線と弦のある円：方べきの定理で長さを求める。', '円周角の性質で内接四角形の角を求める。'],
    },
    traps: {
      en: ['In Menelaus the three points go around the triangle in order; mixing the order breaks the product.', 'The power of a point uses the whole segments from $P$, not the chord lengths.', 'Area ratios of triangles with the same height equal the base ratios — use this instead of computing areas.'],
      ja: ['メネラウスは三角形を一周する順で3点をとる。順番を混ぜると崩れる。', '方べきは $P$ からの線分全体を使う。弦の長さではない。', '高さが同じ三角形の面積比＝底辺の比。面積を計算する必要はない。'],
    },
    followups: {
      en: ['Explain Menelaus with a picture and one worked example.', 'Why does the power of a point work?', 'Quiz me on inscribed-angle facts.'],
      ja: ['メネラウスを絵と例題で説明して。', '方べきの定理が成り立つ理由は？', '円周角の性質のミニテストを出して。'],
    },
  },

  // ───────────────────────────── COUNTING AND PROBABILITY ───────────────────
  {
    id: 'counting',
    core: {
      en: 'Order matters → permutation $nPr$. Order does not matter → combination $nCr$. Every counting problem is: decide whether order matters, then multiply the choices stage by stage.',
      ja: '並べる（順番あり）→ 順列 $nPr$、選ぶだけ（順番なし）→ 組合せ $nCr$。すべての数え上げは「順番が関係あるか」を決めて、段階ごとに選び方をかける。',
    },
    body: {
      en: r`## Two rules
- **Product rule**: independent stages multiply (3 shirts × 2 trousers = 6 outfits).
- **Sum rule**: cases that cannot happen together add.

## Formulas
| | formula | example |
|---|---|---|
| permutations | $nPr = \dfrac{n!}{(n-r)!}$ | arrange 3 of 5 people: $5\cdot4\cdot3 = 60$ |
| combinations | $nCr = \dfrac{n!}{r!(n-r)!}$ | choose 3 of 5: $\dfrac{60}{3!} = 10$ |
| circular | $(n-1)!$ | 5 people round a table: $24$ |
| with repeats | $\dfrac{n!}{p!\,q!\cdots}$ | letters of AABBC: $\dfrac{5!}{2!2!} = 30$ |
| repetition allowed | $n^r$ | 3-digit codes from 0-9: $10^3$ |

$nCr = nC_{n-r}$ (choosing 3 to take = choosing 2 to leave).

## Standard moves
- "At least one" → total minus "none".
- "A and B next to each other" → glue them into one block, then multiply by $2!$ for their internal order.
- "A and B not next to each other" → total minus "next to each other".
- Distribute identical balls into boxes → dividers (○ and | arrangement).

> Write the stages in words before you touch a formula: "choose the position of the 1, then fill the rest".`,
      ja: r`## 2つの法則
- **積の法則**：独立な段階はかける（シャツ3×ズボン2＝6通り）。
- **和の法則**：同時に起こらない場合はたす。

## 公式
| | 公式 | 例 |
|---|---|---|
| 順列 | $nPr = \dfrac{n!}{(n-r)!}$ | 5人から3人並べる：$5\cdot4\cdot3 = 60$ |
| 組合せ | $nCr = \dfrac{n!}{r!(n-r)!}$ | 5人から3人選ぶ：$\dfrac{60}{3!} = 10$ |
| 円順列 | $(n-1)!$ | 5人が円卓：$24$ |
| 同じものを含む | $\dfrac{n!}{p!\,q!\cdots}$ | AABBC の並べ方：$\dfrac{5!}{2!2!} = 30$ |
| 重複順列 | $n^r$ | 0〜9で3桁：$10^3$ |

$nCr = nC_{n-r}$（3つ選ぶ＝残す2つを選ぶ）。

## 定番の手
- 「少なくとも1つ」→ 全体 − 「1つもない」。
- 「A と B が隣り合う」→ 1つのかたまりにして並べ、中の並び $2!$ をかける。
- 「隣り合わない」→ 全体 − 「隣り合う」。
- 同じ玉を箱に分ける → 仕切り（○と｜の並べ方）。

> 公式の前に段階を言葉で書く：「1の位置を決めて、残りを埋める」。`,
    },
    exam: {
      en: ['Arrangements with a condition (ends fixed, letters adjacent, no two vowels together).', 'Number of integers formed from given digits, often with "divisible by 3" or "even" conditions.', 'Choose committees with "at least one woman" (complement).'],
      ja: ['条件つきの並べ方（両端固定、隣り合う、母音が隣り合わない）。', '与えられた数字で作る整数の個数（偶数・3の倍数の条件つき）。', '「少なくとも1人女性」の委員の選び方（余事象）。'],
    },
    traps: {
      en: ['Using $nPr$ when the order does not matter counts each group $r!$ times.', 'A number cannot start with 0 — handle the first digit first.', 'Circular arrangements: fix one person, arrange the rest.'],
      ja: ['順番が関係ないのに $nPr$ を使うと $r!$ 倍に数えすぎる。', '先頭は0にできない。まず先頭を決める。', '円順列は1人を固定して残りを並べる。'],
    },
    followups: {
      en: ['Why is the circular count $(n-1)!$?', 'Show me the dividers method on "10 identical balls into 3 boxes".', 'Quiz me: permutation or combination?'],
      ja: ['円順列が $(n-1)!$ になる理由は？', '「同じ玉10個を3箱へ」を仕切りで解いて。', '順列か組合せかを判断するミニテストを出して。'],
    },
  },
  {
    id: 'probability',
    core: {
      en: 'Probability = (favourable outcomes) ÷ (all equally likely outcomes). Count both with the same method. Independent events multiply; "given that" means shrink the whole space to the condition.',
      ja: '確率＝（条件に合う場合の数）÷（同様に確からしい全体の場合の数）。分子と分母は同じ数え方で。独立ならかける、「〜のとき」（条件付き）は全体をその条件の中に縮める。',
    },
    body: {
      en: r`## Basics
$P(A) = \dfrac{n(A)}{n(U)}$, $0 \le P \le 1$, $P(\overline A) = 1 - P(A)$.
$P(A \cup B) = P(A) + P(B) - P(A \cap B)$; if $A, B$ cannot both happen, just add.

## Independent and repeated trials
Independent: $P(A \cap B) = P(A)P(B)$.
Repeated trials: probability of exactly $r$ successes in $n$ tries with success probability $p$:
$$nCr\, p^r (1-p)^{n-r}$$
(choose *which* tries succeed, then multiply the probabilities.)

## Conditional probability
$$P(B \mid A) = \frac{P(A \cap B)}{P(A)} \qquad\text{so}\qquad P(A \cap B) = P(A)\,P(B \mid A)$$
"Given $A$ happened" = pretend $A$ is the whole world. Bayes-type questions ("it was defective; which machine made it?") are just this formula with a table of all cases.

## Expected value
$E = \sum (\text{value}) \times (\text{probability})$. Make a table: value, probability, product; add the products.

> Dice and coins: treat every die/coin as distinguishable ($6^2 = 36$ outcomes for two dice) so outcomes are equally likely.`,
      ja: r`## 基本
$P(A) = \dfrac{n(A)}{n(U)}$、$0 \le P \le 1$、$P(\overline A) = 1 - P(A)$。
$P(A \cup B) = P(A) + P(B) - P(A \cap B)$。同時に起こらないならたすだけ。

## 独立試行・反復試行
独立：$P(A \cap B) = P(A)P(B)$。
反復試行：成功確率 $p$ で $n$ 回中ちょうど $r$ 回成功する確率
$$nCr\, p^r (1-p)^{n-r}$$
（どの回で成功するかを選び、確率をかける。）

## 条件付き確率
$$P(B \mid A) = \frac{P(A \cap B)}{P(A)} \qquad\text{つまり}\qquad P(A \cap B) = P(A)\,P(B \mid A)$$
「$A$ が起こったとき」＝$A$ を全体だと思う。「不良品だった、どの機械製？」型はこの式と全パターンの表で解ける。

## 期待値
$E = \sum (\text{値}) \times (\text{確率})$。値・確率・積の表を作り、積を全部たす。

> サイコロや硬貨は区別する（2個のサイコロで $6^2 = 36$ 通り）。そうしないと同様に確からしくない。`,
    },
    exam: {
      en: ['Two dice: probability the sum or product satisfies a condition.', 'Repeated trials: exactly $r$ successes, or "the third success on the fifth try".', 'Conditional probability with a defective-product or urn table, then expected value.'],
      ja: ['サイコロ2個：和や積の条件を満たす確率。', '反復試行：ちょうど $r$ 回、または「5回目に3回目の成功」。', '不良品・袋の玉の表から条件付き確率、続いて期待値。'],
    },
    traps: {
      en: ['Drawing without replacement changes the probabilities each draw; with replacement they stay the same.', '"The third success on the fifth try": the fifth try is fixed as a success, choose 2 successes among the first 4.', 'Conditional probability divides by $P(A)$, not by 1.'],
      ja: ['元に戻さない場合は毎回確率が変わる。戻す場合は同じ。', '「5回目に3回目の成功」：5回目は成功で固定、最初の4回から2回を選ぶ。', '条件付き確率は $P(A)$ で割る。1で割らない。'],
    },
    followups: {
      en: ['Explain conditional probability with a 2×2 table.', 'Why do we multiply by $nCr$ in repeated trials?', 'Give me a dice problem and check my answer.'],
      ja: ['条件付き確率を 2×2 の表で説明して。', '反復試行で $nCr$ をかける理由は？', 'サイコロの問題を出して答えを確認して。'],
    },
  },

  // ───────────────────────────── INTEGERS ───────────────────
  {
    id: 'divisors-gcd',
    core: {
      en: 'Prime factorisation is the DNA of a number. From $n = p^a q^b$ you read the number of divisors $(a+1)(b+1)$, the gcd (take the smaller powers) and the lcm (take the larger). Euclid finds the gcd when factorising is slow.',
      ja: '素因数分解は数の設計図。$n = p^a q^b$ から約数の個数 $(a+1)(b+1)$、最大公約数（小さい方の指数）、最小公倍数（大きい方の指数）が読める。分解が面倒なときは互除法。',
    },
    body: {
      en: r`## From the factorisation
$360 = 2^3 \cdot 3^2 \cdot 5$
- number of divisors: $(3+1)(2+1)(1+1) = 24$
- sum of divisors: $(1+2+4+8)(1+3+9)(1+5)$
- gcd$(a,b)$: each prime to the **smaller** power; lcm: the **larger**.
- $\gcd(a,b) \times \text{lcm}(a,b) = ab$.

## Euclidean algorithm
$\gcd(a, b) = \gcd(b, a \bmod b)$ until the remainder is 0.
$\gcd(1071, 462)$: $1071 = 2\cdot462 + 147$, $462 = 3\cdot147 + 21$, $147 = 7\cdot21 + 0$ → gcd $= 21$.

## Remainders
Write $n = qk + r$. To prove "$n^2$ leaves remainder 0 or 1 when divided by 4", set $n = 2k$ or $2k+1$ and square.
Divisibility: by 3 or 9 → digit sum; by 4 → last two digits; by 8 → last three.

## Squares and "perfect square" questions
$n$ is a perfect square $\iff$ every exponent in its factorisation is even. "Smallest $k$ with $kn$ a square" → supply the missing odd exponents.

> Always start by factorising the numbers in the problem. Most integer questions then become bookkeeping.`,
      ja: r`## 素因数分解から読む
$360 = 2^3 \cdot 3^2 \cdot 5$
- 約数の個数：$(3+1)(2+1)(1+1) = 24$
- 約数の和：$(1+2+4+8)(1+3+9)(1+5)$
- 最大公約数：各素数の**小さい**方の指数、最小公倍数：**大きい**方。
- $\gcd(a,b) \times \text{lcm}(a,b) = ab$。

## ユークリッドの互除法
余りが0になるまで $\gcd(a, b) = \gcd(b, a \bmod b)$。
$\gcd(1071, 462)$：$1071 = 2\cdot462 + 147$、$462 = 3\cdot147 + 21$、$147 = 7\cdot21 + 0$ → 21。

## 余り
$n = qk + r$ と書く。「$n^2$ を4で割った余りは0か1」は $n = 2k$、$2k+1$ とおいて2乗。
倍数判定：3・9 → 各位の和、4 → 下2桁、8 → 下3桁。

## 平方数
$n$ が平方数 $\iff$ 素因数分解の指数がすべて偶数。「$kn$ が平方数になる最小の $k$」→ 奇数の指数を補う。

> 問題の数はまず素因数分解する。整数問題の多くはそこから作業になる。`,
    },
    exam: {
      en: ['Number of divisors, or the smallest $k$ making $kn$ a perfect square.', 'gcd/lcm from two numbers given by conditions, e.g. gcd 6, lcm 180 — find the pairs.', 'Remainder proofs by cases $n = 3k, 3k+1, 3k+2$.'],
      ja: ['約数の個数、$kn$ が平方数になる最小の $k$。', '最大公約数6・最小公倍数180 となる2数の組。', '$n = 3k, 3k+1, 3k+2$ の場合分けで余りを示す。'],
    },
    traps: {
      en: ['$1$ is not prime; $2$ is the only even prime.', 'Number of divisors counts 1 and $n$ itself.', 'gcd of $a = 6a\', b = 6b\'$ requires $a\', b\'$ coprime — do not forget that condition when listing pairs.'],
      ja: ['1は素数ではない。2は唯一の偶数の素数。', '約数の個数には1と $n$ 自身も含む。', '$a = 6a\', b = 6b\'$ とおくとき $a\', b\'$ は互いに素。組を列挙するとき忘れない。'],
    },
    followups: {
      en: ['Why does the divisor-count formula work?', 'Show Euclid on 252 and 105.', 'Quiz me on divisibility rules.'],
      ja: ['約数の個数の公式が成り立つ理由は？', '252と105で互除法をやって。', '倍数判定法のミニテストを出して。'],
    },
  },
  {
    id: 'diophantine-bases',
    core: {
      en: 'To solve $ax + by = c$ in integers: find one solution (by inspection or Euclid), then all others are that solution shifted by $(b, -a)$ multiples. A base-$n$ number is just place values of powers of $n$.',
      ja: '$ax + by = c$ の整数解：まず1組見つけ（見当か互除法）、あとは $(b, -a)$ の倍だけずらしたものが全部。$n$ 進法は「$n$ の累乗の位取り」にすぎない。',
    },
    body: {
      en: r`## Linear Diophantine equations
$3x + 5y = 1$. One solution: $x = 2, y = -1$. Subtract: $3(x-2) + 5(y+1) = 0 \Rightarrow 3(x-2) = -5(y+1)$.
Since 3 and 5 are coprime, $x - 2 = 5k$, $y + 1 = -3k$:
$$x = 5k + 2,\quad y = -3k - 1 \quad (k \in \mathbb Z)$$
For a right-hand side $c$, multiply the particular solution by $c$ first.
If $\gcd(a,b)$ does not divide $c$ there is no solution.

## Finding one solution with Euclid
Run the algorithm, then work backwards to express the gcd as $ax + by$.

## Bases
$1101_{(2)} = 1\cdot2^3 + 1\cdot2^2 + 0\cdot2 + 1 = 13$.
Decimal → base $n$: divide by $n$ repeatedly, read the remainders from the bottom up.
Fractions: $0.101_{(2)} = \frac12 + \frac18$.

## Products and sums equal to a constant
$xy + 2x + y = 7 \Rightarrow (x+1)(y+2) = 9$: list the factor pairs of 9 (including negatives).

> Coprime is the key word: $a \mid bc$ with $\gcd(a,b) = 1$ forces $a \mid c$.`,
      ja: r`## 1次不定方程式
$3x + 5y = 1$。1組の解：$x = 2, y = -1$。辺々引く：$3(x-2) + 5(y+1) = 0 \Rightarrow 3(x-2) = -5(y+1)$。
3と5は互いに素なので $x - 2 = 5k$、$y + 1 = -3k$：
$$x = 5k + 2,\quad y = -3k - 1 \quad (k \text{ は整数})$$
右辺が $c$ なら、まず特殊解を $c$ 倍する。
$\gcd(a,b)$ が $c$ を割り切らなければ解なし。

## 互除法で1組見つける
互除法の式を逆にたどって、最大公約数を $ax + by$ の形で表す。

## $n$ 進法
$1101_{(2)} = 1\cdot2^3 + 1\cdot2^2 + 0\cdot2 + 1 = 13$。
10進 → $n$ 進：$n$ で割り続けて余りを下から読む。
小数：$0.101_{(2)} = \frac12 + \frac18$。

## 積の形にする
$xy + 2x + y = 7 \Rightarrow (x+1)(y+2) = 9$：9の約数の組（負も含む）を列挙。

> キーワードは「互いに素」：$\gcd(a,b) = 1$ で $a \mid bc$ なら $a \mid c$。`,
    },
    exam: {
      en: ['General integer solution of $ax + by = c$, then the solution with smallest positive $x$.', 'Convert between base 2, 5 and 10; count digits.', 'Turn $xy + ax + by = c$ into a product and list integer pairs.'],
      ja: ['$ax + by = c$ の一般解、次に $x$ が最小の正の解。', '2進・5進・10進の変換、桁数。', '$xy + ax + by = c$ を積の形にして整数の組を列挙。'],
    },
    traps: {
      en: ['The shift is by $(b, -a)$ divided by the gcd — after dividing the equation by the gcd.', 'Negative factor pairs count too.', 'Reading remainders top-down instead of bottom-up when converting bases.'],
      ja: ['ずらす幅は最大公約数で割ったあとの $(b, -a)$。', '負の約数の組も忘れない。', '進法の変換で余りを上から読むと逆になる。'],
    },
    followups: {
      en: ['Show the "work backwards through Euclid" trick on $17x + 5y = 1$.', 'Why must $\\gcd(a,b)$ divide $c$?', 'Quiz me on base conversions.'],
      ja: ['$17x + 5y = 1$ で互除法を逆にたどる方法を見せて。', '$\\gcd(a,b)$ が $c$ を割り切る必要があるのはなぜ？', '進法変換のミニテストを出して。'],
    },
  },

  // ───────────────────────────── EXPRESSIONS AND PROOFS ───────────────────
  {
    id: 'binomial-division',
    core: {
      en: '$(a+b)^n$ expands into terms $nCr\\,a^{n-r}b^r$; to get one coefficient, pick the $r$ that gives the power you want. Polynomial division is long division with letters: $A = BQ + R$.',
      ja: '$(a+b)^n$ の各項は $nCr\\,a^{n-r}b^r$。特定の係数は、ほしい次数になる $r$ を選ぶだけ。整式の割り算は文字の筆算：$A = BQ + R$。',
    },
    body: {
      en: r`## Binomial theorem
$$(a+b)^n = \sum_{r=0}^{n} nCr\, a^{n-r} b^r$$
Coefficient of $x^3$ in $(2x - 1)^5$: term $5C3 (2x)^{2}(-1)^{3}$? No — match the power: $(2x)^{5-r}$ has $x^3$ when $r = 2$: $5C2 \cdot 2^3 \cdot (-1)^2 = 80$.
Pascal's triangle gives $nCr$ quickly for small $n$. Useful values: $(1+1)^n = 2^n$ (sum of all $nCr$).

## Polynomial division
Divide $A$ by $B$: $A = BQ + R$ with $\deg R < \deg B$. Set up like numeric long division, cancel the top term each step.
Special case: dividing by $x - a$ gives remainder $A(a)$ (remainder theorem, next note).

## Fractional expressions
Factorise everything, cancel common factors, then add with a common denominator.
$\dfrac{1}{x(x+1)} = \dfrac1x - \dfrac1{x+1}$ (partial fractions) — the standard telescoping tool later in sequences.

> Match the power of $x$ *before* computing; most binomial mistakes are picking the wrong $r$.`,
      ja: r`## 二項定理
$$(a+b)^n = \sum_{r=0}^{n} nCr\, a^{n-r} b^r$$
$(2x - 1)^5$ の $x^3$ の係数：$(2x)^{5-r}$ が $x^3$ になるのは $r = 2$。$5C2 \cdot 2^3 \cdot (-1)^2 = 80$。
小さい $n$ ならパスカルの三角形が速い。$(1+1)^n = 2^n$（$nCr$ の総和）も覚える。

## 整式の割り算
$A$ を $B$ で割る：$A = BQ + R$、$\deg R < \deg B$。数の筆算と同じ形で、最高次の項を毎回消す。
$x - a$ で割った余りは $A(a)$（剰余の定理、次のノート）。

## 分数式
すべて因数分解し、共通因数を約分してから通分してたす。
$\dfrac{1}{x(x+1)} = \dfrac1x - \dfrac1{x+1}$（部分分数）——数列の和で使う定番。

> 計算の前に $x$ の次数を合わせる。二項定理のミスはほぼ $r$ の選び間違い。`,
    },
    exam: {
      en: ['Coefficient of a specific term in $(ax + b)^n$ or $(x + 1/x)^n$ (constant term).', 'Divide a cubic by a quadratic and give quotient and remainder.', 'Simplify a fractional expression or split into partial fractions.'],
      ja: ['$(ax + b)^n$、$(x + 1/x)^n$ の特定の項の係数（定数項）。', '3次式を2次式で割って商と余り。', '分数式の簡単化、部分分数分解。'],
    },
    traps: {
      en: ['Signs: $(-1)^r$ alternates; track it.', 'In $(x + 1/x)^n$ the constant term needs $n - r = r$, so it only exists for even $n$.', 'The remainder must have lower degree than the divisor.'],
      ja: ['符号：$(-1)^r$ は交互に変わる。', '$(x + 1/x)^n$ の定数項は $n - r = r$、つまり $n$ が偶数のときだけ。', '余りの次数は割る式より低い。'],
    },
    followups: {
      en: ['Why is the coefficient $nCr$? Explain it by choosing.', 'Show the long division layout on $(x^3 + 2x - 1) \\div (x^2 + 1)$.', 'Quiz me on coefficients in expansions.'],
      ja: ['係数が $nCr$ になる理由を「選ぶ」で説明して。', '$(x^3 + 2x - 1) \\div (x^2 + 1)$ の筆算を見せて。', '展開の係数のミニテストを出して。'],
    },
  },
  {
    id: 'identities-proofs',
    core: {
      en: 'An identity holds for every $x$, so matching coefficients (or plugging in convenient values) pins down the unknowns. To prove $A \\ge B$, show $A - B$ is a square or a sum of squares, or use AM ≥ GM.',
      ja: '恒等式はすべての $x$ で成り立つので、係数比較（または都合のよい値の代入）で未知数が決まる。$A \\ge B$ の証明は $A - B$ を平方（の和）にするか、相加相乗平均を使う。',
    },
    body: {
      en: r`## Identities
$ax^2 + bx + c = 2x^2 - 3x + 1$ for all $x$ $\iff a = 2, b = -3, c = 1$.
Two methods: **compare coefficients** after expanding, or **substitute** as many values as unknowns (e.g. $x = 0, 1, -1$).

## Proving inequalities
1. Compute $A - B$ and rearrange into $(\ )^2 \ge 0$ or $(\ )^2 + (\ )^2 \ge 0$.
2. State when equality holds (the squares are zero).

Example: $a^2 + b^2 \ge 2ab$ because $a^2 + b^2 - 2ab = (a-b)^2 \ge 0$, equality at $a = b$.

## AM–GM (相加相乗平均)
For $a, b > 0$:
$$\frac{a+b}{2} \ge \sqrt{ab}, \qquad \text{equality when } a = b$$
Use it for minimums of things like $x + \dfrac{4}{x}$ ($x>0$): $\ge 2\sqrt{4} = 4$, equality at $x = 2$.

## Other tools
- $|a| + |b| \ge |a + b|$ (triangle inequality).
- Cauchy–Schwarz: $(a^2 + b^2)(x^2 + y^2) \ge (ax + by)^2$.

> Always write the equality condition; EJU marks it as part of the answer.`,
      ja: r`## 恒等式
すべての $x$ で $ax^2 + bx + c = 2x^2 - 3x + 1$ $\iff a = 2, b = -3, c = 1$。
方法は2つ：展開して**係数比較**、または未知数の個数だけ**値を代入**（$x = 0, 1, -1$ など）。

## 不等式の証明
1. $A - B$ を計算し、$(\ )^2 \ge 0$ や $(\ )^2 + (\ )^2 \ge 0$ の形にする。
2. 等号成立の条件を書く（平方が0になるとき）。

例：$a^2 + b^2 - 2ab = (a-b)^2 \ge 0$ より $a^2 + b^2 \ge 2ab$、等号は $a = b$。

## 相加平均・相乗平均
$a, b > 0$ のとき
$$\frac{a+b}{2} \ge \sqrt{ab}, \qquad \text{等号は } a = b$$
$x + \dfrac{4}{x}$（$x>0$）の最小値：$\ge 2\sqrt{4} = 4$、等号は $x = 2$。

## その他
- $|a| + |b| \ge |a + b|$（三角不等式）
- コーシー・シュワルツ：$(a^2 + b^2)(x^2 + y^2) \ge (ax + by)^2$

> 等号成立条件は必ず書く。EJUでは答えの一部。`,
    },
    exam: {
      en: ['Find constants so an equation is an identity (partial-fraction setup).', 'Minimum of $x + k/x$ or $(a + 1/b)(b + 1/a)$ by AM–GM with the equality case.', 'Prove $a^2 + b^2 + c^2 \\ge ab + bc + ca$.'],
      ja: ['恒等式になる定数を決める（部分分数の準備）。', '相加相乗平均で $x + k/x$ などの最小値と等号条件。', '$a^2 + b^2 + c^2 \\ge ab + bc + ca$ の証明。'],
    },
    traps: {
      en: ['AM–GM needs positive numbers.', 'A minimum found by AM–GM is only valid if equality can actually be reached.', 'Substituting values proves an identity only if you use enough values (one per unknown).'],
      ja: ['相加相乗平均は正の数だけ。', '相加相乗平均の最小値は、等号が実際に成り立つときだけ有効。', '代入法は未知数の個数だけ値を入れて初めて決まる。'],
    },
    followups: {
      en: ['Prove AM–GM for two numbers with a square.', 'Why must I check the equality case in a minimum problem?', 'Give me two inequality proofs to try.'],
      ja: ['2数の相加相乗平均を平方で証明して。', '最小値の問題で等号条件を確認する理由は？', '不等式の証明問題を2問出して。'],
    },
  },
  {
    id: 'complex-numbers',
    core: {
      en: '$i$ is a number with $i^2 = -1$; complex numbers $a + bi$ add and multiply like polynomials, then replace $i^2$ by $-1$. Roots and coefficients: for $ax^2+bx+c=0$, sum of roots $= -b/a$, product $= c/a$, no solving needed.',
      ja: '$i$ は $i^2 = -1$ となる数。複素数 $a + bi$ は多項式のように計算して $i^2$ を $-1$ に置き換える。解と係数の関係：$ax^2+bx+c=0$ の解の和は $-b/a$、積は $c/a$。解かなくてよい。',
    },
    body: {
      en: r`## Arithmetic
$(2 + 3i)(1 - i) = 2 - 2i + 3i - 3i^2 = 5 + i$.
Division: multiply top and bottom by the conjugate $\overline{a + bi} = a - bi$:
$\dfrac{1}{1+i} = \dfrac{1-i}{(1+i)(1-i)} = \dfrac{1-i}{2}$.
Equality: $a + bi = c + di \iff a = c$ and $b = d$ (compare real and imaginary parts).

## Square roots of negatives
$\sqrt{-3} = \sqrt3\, i$. Convert **before** multiplying: $\sqrt{-2}\sqrt{-3} = \sqrt2 i \cdot \sqrt3 i = -\sqrt6$, not $\sqrt6$.

## Quadratics with $D < 0$
Solutions are conjugates $p \pm qi$. Real coefficients ⇒ complex roots come in conjugate pairs.

## Roots and coefficients (解と係数の関係)
For $ax^2 + bx + c = 0$ with roots $\alpha, \beta$:
$$\alpha + \beta = -\frac ba, \qquad \alpha\beta = \frac ca$$
Then $\alpha^2 + \beta^2 = (\alpha+\beta)^2 - 2\alpha\beta$, and a quadratic with roots $\alpha, \beta$ is $x^2 - (\alpha+\beta)x + \alpha\beta = 0$.

> Whenever a question asks for a *symmetric* expression in the roots, do not solve — use sum and product.`,
      ja: r`## 計算
$(2 + 3i)(1 - i) = 2 - 2i + 3i - 3i^2 = 5 + i$。
割り算：分母の共役 $\overline{a + bi} = a - bi$ を上下にかける：
$\dfrac{1}{1+i} = \dfrac{1-i}{(1+i)(1-i)} = \dfrac{1-i}{2}$。
相等：$a + bi = c + di \iff a = c$ かつ $b = d$（実部・虚部を比較）。

## 負の数の平方根
$\sqrt{-3} = \sqrt3\, i$。かける**前**に直す：$\sqrt{-2}\sqrt{-3} = \sqrt2 i \cdot \sqrt3 i = -\sqrt6$（$\sqrt6$ ではない）。

## $D < 0$ の2次方程式
解は共役な $p \pm qi$。実数係数なら虚数解は必ず共役のペア。

## 解と係数の関係
$ax^2 + bx + c = 0$ の解 $\alpha, \beta$ について
$$\alpha + \beta = -\frac ba, \qquad \alpha\beta = \frac ca$$
$\alpha^2 + \beta^2 = (\alpha+\beta)^2 - 2\alpha\beta$。$\alpha, \beta$ を解にもつ2次方程式は $x^2 - (\alpha+\beta)x + \alpha\beta = 0$。

> 解の**対称式**を聞かれたら解かない。和と積で計算する。`,
    },
    exam: {
      en: ['Compute $\\alpha^2 + \\beta^2$, $\\alpha^3 + \\beta^3$ or $1/\\alpha + 1/\\beta$ from a quadratic without solving it.', 'Find real $a, b$ from a complex equation by comparing parts.', 'Build the quadratic whose roots are $\\alpha + 1$ and $\\beta + 1$.'],
      ja: ['2次方程式を解かずに $\\alpha^2 + \\beta^2$、$\\alpha^3 + \\beta^3$、$1/\\alpha + 1/\\beta$。', '複素数の等式から実数 $a, b$ を決める。', '$\\alpha + 1$、$\\beta + 1$ を解にもつ2次方程式を作る。'],
    },
    traps: {
      en: ['$\\sqrt{-2}\\sqrt{-3} \\ne \\sqrt6$; convert to $i$ first.', 'Sum of roots is $-b/a$ with a minus sign.', 'Complex numbers have no order: "$z > 0$" makes sense only for real $z$.'],
      ja: ['$\\sqrt{-2}\\sqrt{-3} \\ne \\sqrt6$。先に $i$ に直す。', '解の和は $-b/a$。マイナスがつく。', '複素数に大小はない。「$z > 0$」は実数のときだけ。'],
    },
    followups: {
      en: ['Why do complex roots come in conjugate pairs?', 'Derive the roots-and-coefficients formulas.', 'Quiz me on symmetric expressions of roots.'],
      ja: ['虚数解が共役のペアになる理由は？', '解と係数の関係を導いて。', '解の対称式のミニテストを出して。'],
    },
  },
  {
    id: 'higher-equations',
    core: {
      en: 'Dividing $P(x)$ by $x - a$ leaves remainder $P(a)$. So if $P(a) = 0$, then $x - a$ is a factor: guess a root among divisors of the constant term, divide, and the cubic becomes a quadratic.',
      ja: '$P(x)$ を $x - a$ で割った余りは $P(a)$。だから $P(a) = 0$ なら $x - a$ は因数：定数項の約数から解を1つ当て、割って、3次を2次に落とす。',
    },
    body: {
      en: r`## Remainder and factor theorems
- Remainder theorem: $P(x) \div (x - a)$ has remainder $P(a)$. Dividing by $(ax - b)$: remainder $P(b/a)$.
- Factor theorem: $P(a) = 0 \iff (x - a)$ divides $P(x)$.

## Solving a cubic
$P(x) = x^3 - 2x^2 - 5x + 6$. Try $x = \pm1, \pm2, \pm3, \pm6$ (divisors of 6): $P(1) = 0$.
Divide by $(x-1)$: $P(x) = (x-1)(x^2 - x - 6) = (x-1)(x-3)(x+2)$. Roots $1, 3, -2$.
Candidates for a rational root: $\pm\dfrac{\text{divisor of constant}}{\text{divisor of leading coefficient}}$.

## Remainder with a quadratic divisor
Dividing by $(x-1)(x-2)$ leaves $R(x) = px + q$. Use $P(1) = p + q$ and $P(2) = 2p + q$.

## Special forms
- $x^3 = 1$: $x = 1$ or $x^2 + x + 1 = 0$, giving $\omega = \dfrac{-1 \pm \sqrt3 i}{2}$ with $\omega^2 + \omega + 1 = 0$, $\omega^3 = 1$.
- $x^4 + x^2 - 6 = 0$: substitute $t = x^2$.
- Roots and coefficients for a cubic $x^3 + bx^2 + cx + d = 0$: $\alpha+\beta+\gamma = -b$, $\alpha\beta + \beta\gamma + \gamma\alpha = c$, $\alpha\beta\gamma = -d$.

> Two-step rhythm: find one root, reduce the degree, repeat.`,
      ja: r`## 剰余の定理・因数定理
- 剰余の定理：$P(x) \div (x - a)$ の余りは $P(a)$。$(ax - b)$ で割るなら余りは $P(b/a)$。
- 因数定理：$P(a) = 0 \iff (x - a)$ で割り切れる。

## 3次方程式の解き方
$P(x) = x^3 - 2x^2 - 5x + 6$。$x = \pm1, \pm2, \pm3, \pm6$（6の約数）を試す：$P(1) = 0$。
$(x-1)$ で割る：$P(x) = (x-1)(x^2 - x - 6) = (x-1)(x-3)(x+2)$。解は $1, 3, -2$。
有理数解の候補：$\pm\dfrac{定数項の約数}{最高次の係数の約数}$。

## 2次式で割った余り
$(x-1)(x-2)$ で割った余りは $R(x) = px + q$。$P(1) = p + q$、$P(2) = 2p + q$ から決める。

## 特別な形
- $x^3 = 1$：$x = 1$ または $x^2 + x + 1 = 0$。$\omega = \dfrac{-1 \pm \sqrt3 i}{2}$ で $\omega^2 + \omega + 1 = 0$、$\omega^3 = 1$。
- $x^4 + x^2 - 6 = 0$：$t = x^2$ とおく。
- 3次の解と係数：$x^3 + bx^2 + cx + d = 0$ で $\alpha+\beta+\gamma = -b$、$\alpha\beta + \beta\gamma + \gamma\alpha = c$、$\alpha\beta\gamma = -d$。

> リズムは2拍子：解を1つ見つける → 次数を下げる → 繰り返す。`,
    },
    exam: {
      en: ['Find constants so that $P(x)$ is divisible by $x - 1$ and leaves remainder 2 when divided by $x + 1$.', 'Solve a cubic with one given root (often a complex one: use the conjugate too).', 'Find the remainder when dividing by a quadratic using $P(a)$ values.'],
      ja: ['$x - 1$ で割り切れ、$x + 1$ で割ると余り2になる定数を決める。', '1つの解（虚数解なら共役も）が与えられた3次方程式を解く。', '$P(a)$ の値を使って2次式で割った余りを求める。'],
    },
    traps: {
      en: ['Remainder when dividing by $(2x - 1)$ is $P(1/2)$, not $P(1)$.', 'After finding one root, the remaining factor may not factorise — use the quadratic formula.', 'A repeated root counts once in the list of solutions but affects sign changes.'],
      ja: ['$(2x - 1)$ で割った余りは $P(1/2)$。$P(1)$ ではない。', '解を1つ見つけたあとの2次式は因数分解できないこともある。解の公式へ。', '重解は解としては1つ。'],
    },
    followups: {
      en: ['Why is the remainder exactly $P(a)$?', 'Show me synthetic division (組立除法).', 'Quiz me: three cubics to factorise.'],
      ja: ['余りがちょうど $P(a)$ になる理由は？', '組立除法を見せて。', '3次式の因数分解を3問出して。'],
    },
  },

  // ───────────────────────────── FIGURES AND EQUATIONS ───────────────────
  {
    id: 'points-lines',
    core: {
      en: 'A line is a gradient and one point. Parallel lines share the gradient; perpendicular gradients multiply to $-1$. The distance from a point to a line is one formula you must know by heart.',
      ja: '直線は「傾き＋1点」で決まる。平行なら傾きが同じ、垂直なら傾きの積が $-1$。点と直線の距離の公式は暗記必須。',
    },
    body: {
      en: r`## Points
Distance $AB = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$.
Point dividing $AB$ in the ratio $m:n$ (internally): $\left(\dfrac{nx_1 + mx_2}{m+n}, \dfrac{ny_1 + my_2}{m+n}\right)$; midpoint is $m = n$. Externally: replace $n$ by $-n$.
Centroid of a triangle: average of the three vertices.

## Lines
| given | equation |
|---|---|
| gradient $m$, point $(x_1, y_1)$ | $y - y_1 = m(x - x_1)$ |
| two points | gradient $\dfrac{y_2 - y_1}{x_2 - x_1}$, then as above |
| general | $ax + by + c = 0$ (covers vertical lines) |

Parallel: $m_1 = m_2$. Perpendicular: $m_1 m_2 = -1$.

## Distance from $(x_0, y_0)$ to $ax + by + c = 0$
$$d = \frac{|ax_0 + by_0 + c|}{\sqrt{a^2 + b^2}}$$

## Reflections
Reflect $A$ in line $\ell$ to $A'$: $AA' \perp \ell$ and the midpoint of $AA'$ lies on $\ell$. Two equations, two unknowns.
Shortest path via a line (river problems): reflect one point, draw the straight line.

> Convert everything to $ax + by + c = 0$ before using the distance formula.`,
      ja: r`## 点
距離 $AB = \sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$。
$AB$ を $m:n$ に内分する点：$\left(\dfrac{nx_1 + mx_2}{m+n}, \dfrac{ny_1 + my_2}{m+n}\right)$、中点は $m = n$。外分は $n$ を $-n$ に。
三角形の重心：3頂点の平均。

## 直線
| わかっているもの | 式 |
|---|---|
| 傾き $m$ と点 $(x_1, y_1)$ | $y - y_1 = m(x - x_1)$ |
| 2点 | 傾き $\dfrac{y_2 - y_1}{x_2 - x_1}$ を出して上の式 |
| 一般形 | $ax + by + c = 0$（$y$ 軸に平行な直線も表せる） |

平行：$m_1 = m_2$。垂直：$m_1 m_2 = -1$。

## 点 $(x_0, y_0)$ と直線 $ax + by + c = 0$ の距離
$$d = \frac{|ax_0 + by_0 + c|}{\sqrt{a^2 + b^2}}$$

## 対称点
直線 $\ell$ に関する $A$ の対称点 $A'$：$AA' \perp \ell$ かつ $AA'$ の中点が $\ell$ 上。式2つで未知数2つ。
直線を経由する最短経路：一方の点を折り返して直線で結ぶ。

> 距離の公式を使う前に $ax + by + c = 0$ の形にそろえる。`,
    },
    exam: {
      en: ['Line through a point perpendicular to a given line, then the foot of the perpendicular.', 'Distance from a point to a line; area of a triangle from base × height.', 'Reflection of a point in a line, then shortest path.'],
      ja: ['点を通り与えられた直線に垂直な直線、続いて垂線の足。', '点と直線の距離から三角形の面積。', '直線に関する対称点、続いて最短経路。'],
    },
    traps: {
      en: ['Internal division formula: the coefficients swap ($n$ goes with $x_1$).', 'Vertical lines have no gradient — write $x = k$.', 'Distance formula needs the absolute value; a negative distance is a sign you forgot it.'],
      ja: ['内分点の公式は係数が入れ替わる（$x_1$ に $n$）。', '$y$ 軸に平行な直線は傾きがない。$x = k$ と書く。', '距離の公式は絶対値つき。負になったら忘れている。'],
    },
    followups: {
      en: ['Derive the point-to-line distance formula.', 'Why do perpendicular gradients multiply to $-1$?', 'Give me a reflection problem to try.'],
      ja: ['点と直線の距離の公式を導いて。', '垂直な直線の傾きの積が $-1$ になる理由は？', '対称点の問題を1問出して。'],
    },
  },
  {
    id: 'circles',
    core: {
      en: 'A circle is centre + radius: $(x-a)^2 + (y-b)^2 = r^2$. Line-and-circle questions reduce to one comparison: distance from the centre to the line versus $r$.',
      ja: '円は「中心＋半径」：$(x-a)^2 + (y-b)^2 = r^2$。直線と円の問題は「中心から直線までの距離 $d$ と $r$ の比較」に帰着する。',
    },
    body: {
      en: r`## Equation
$(x-a)^2 + (y-b)^2 = r^2$. From the general form $x^2 + y^2 + lx + my + n = 0$, complete the square in $x$ and $y$ to read centre and radius (it is a circle only if the right side is positive).
Circle through three points: substitute the points into the general form, solve for $l, m, n$.

## Line and circle
Let $d$ = distance from the centre to the line.
| | |
|---|---|
| $d < r$ | two intersection points |
| $d = r$ | tangent |
| $d > r$ | no contact |

Chord length $= 2\sqrt{r^2 - d^2}$.

## Tangents
- At a point $(x_1, y_1)$ on the circle $x^2 + y^2 = r^2$: $x_1 x + y_1 y = r^2$.
- From an outside point: write the line with unknown gradient $m$ and impose $d = r$ (remember the vertical line case).

## Two circles
Centres distance $D$, radii $r_1, r_2$: $|r_1 - r_2| < D < r_1 + r_2$ → two points; $D = r_1 + r_2$ → touch outside; $D = |r_1 - r_2|$ → touch inside.
The line through the two intersection points: subtract the two circle equations.

> Draw the centre and drop the perpendicular to the line. That right triangle (radius, $d$, half-chord) solves most questions.`,
      ja: r`## 方程式
$(x-a)^2 + (y-b)^2 = r^2$。一般形 $x^2 + y^2 + lx + my + n = 0$ は $x$、$y$ について平方完成して中心と半径を読む（右辺が正のときだけ円）。
3点を通る円：一般形に代入して $l, m, n$ を解く。

## 直線と円
中心から直線までの距離を $d$ とする。
| | |
|---|---|
| $d < r$ | 2点で交わる |
| $d = r$ | 接する |
| $d > r$ | 共有点なし |

弦の長さ $= 2\sqrt{r^2 - d^2}$。

## 接線
- 円 $x^2 + y^2 = r^2$ 上の点 $(x_1, y_1)$ での接線：$x_1 x + y_1 y = r^2$。
- 外部の点から：傾き $m$ を未知数にして直線を書き、$d = r$ を課す（$y$ 軸に平行な場合を忘れない）。

## 2つの円
中心間距離 $D$、半径 $r_1, r_2$：$|r_1 - r_2| < D < r_1 + r_2$ → 2点で交わる、$D = r_1 + r_2$ → 外接、$D = |r_1 - r_2|$ → 内接。
2交点を通る直線：2つの円の式を引く。

> 中心を描いて直線に垂線を下ろす。「半径・$d$・弦の半分」の直角三角形でほぼ解ける。`,
    },
    exam: {
      en: ['Range of $k$ for the line $y = x + k$ to meet the circle (compare $d$ with $r$).', 'Tangent lines from an external point; the length of the tangent.', 'Circle through three points, then its centre and radius.'],
      ja: ['直線 $y = x + k$ が円と交わる $k$ の範囲（$d$ と $r$ の比較）。', '外部の点からの接線、接線の長さ。', '3点を通る円、その中心と半径。'],
    },
    traps: {
      en: ['Completing the square with a negative right-hand side means it is not a circle.', 'The tangent formula $x_1 x + y_1 y = r^2$ works only for points ON the circle.', 'From an outside point there are two tangents; one may be vertical and invisible to the $y = mx + c$ setup.'],
      ja: ['平方完成して右辺が負なら円ではない。', '$x_1 x + y_1 y = r^2$ は円**上**の点のときだけ。', '外部の点からの接線は2本。1本が $y$ 軸に平行だと $y = mx + c$ では出てこない。'],
    },
    followups: {
      en: ['Show the $d$ vs $r$ method on one line-and-circle problem.', 'Why does subtracting two circle equations give the common chord?', 'Quiz me on centres and radii from general form.'],
      ja: ['直線と円の問題を $d$ と $r$ の方法で1問。', '2円の式を引くと共通弦の直線になる理由は？', '一般形から中心と半径を読むミニテストを出して。'],
    },
  },
  {
    id: 'loci-regions',
    core: {
      en: 'A locus is "all points that satisfy a condition": name the moving point $(x, y)$, write the condition as an equation, simplify. A region is an inequality: shade the correct side of each boundary and keep the overlap.',
      ja: '軌跡は「条件を満たす点の全体」：動く点を $(x, y)$ とおき、条件を式にして整理する。領域は不等式：各境界線の正しい側を塗り、重なりをとる。',
    },
    body: {
      en: r`## Locus recipe
1. Let the point be $P(x, y)$.
2. Translate the condition (e.g. $PA = 2PB$, or $\angle APB = 90°$) into an equation with $x, y$.
3. Simplify; identify the curve; state any excluded points.

Example: $PA : PB = 2 : 1$ with $A(0,0)$, $B(3,0)$ → $x^2 + y^2 = 4\{(x-3)^2 + y^2\}$ → a circle (an Apollonius circle).
Moving-point problems: if $P$ depends on a parameter $t$, write $x, y$ in terms of $t$ and **eliminate $t$**.

## Regions
- $y > f(x)$: above the graph; $y < f(x)$: below. Dashed boundary for strict inequality.
- $(x-a)^2 + (y-b)^2 < r^2$: inside the circle.
- Product of two factors $> 0$: both positive or both negative (two regions).

## Linear programming (最大最小)
Maximise $x + y$ over a region: slide the line $x + y = k$ parallel to itself; the extreme value happens at a **vertex** of the region (or where a line touches a circle). Check all vertices.

> Always draw the region. A sketch with the vertices labelled is 80% of the answer.`,
      ja: r`## 軌跡の手順
1. 動く点を $P(x, y)$ とおく。
2. 条件（$PA = 2PB$、$\angle APB = 90°$ など）を $x, y$ の式にする。
3. 整理して図形を読み取り、除く点があれば書く。

例：$A(0,0)$、$B(3,0)$ で $PA : PB = 2 : 1$ → $x^2 + y^2 = 4\{(x-3)^2 + y^2\}$ → 円（アポロニウスの円）。
媒介変数 $t$ で動く点：$x, y$ を $t$ で表し、**$t$ を消去**する。

## 領域
- $y > f(x)$：グラフの上側、$y < f(x)$：下側。等号なしは境界を含まない（破線）。
- $(x-a)^2 + (y-b)^2 < r^2$：円の内部。
- 2つの因数の積 $> 0$：両方正または両方負（2つの領域）。

## 線形計画法（最大最小）
領域上で $x + y$ を最大に：直線 $x + y = k$ を平行移動し、領域の**頂点**（または円との接点）で最大最小になる。頂点をすべて確認。

> 必ず領域を描く。頂点に印をつけたスケッチが答えの8割。`,
    },
    exam: {
      en: ['Locus of the midpoint of a chord, or of a point with fixed distance ratio to two points.', 'Draw the region of simultaneous inequalities and find max/min of $ax + by$ or $x^2 + y^2$.', 'Eliminate the parameter to find the path of a moving point.'],
      ja: ['弦の中点の軌跡、2点からの距離の比が一定の点の軌跡。', '連立不等式の領域を描き、$ax + by$ や $x^2 + y^2$ の最大最小。', '媒介変数を消去して動点の軌跡を求める。'],
    },
    traps: {
      en: ['Forgetting to exclude points where the construction breaks (e.g. $P \\ne A, B$).', 'The max of $x^2 + y^2$ is a distance-squared from the origin: look for the farthest point, not a vertex necessarily.', 'Strict vs non-strict inequality decides whether the boundary counts.'],
      ja: ['構成が崩れる点（$P \\ne A, B$ など）を除くのを忘れる。', '$x^2 + y^2$ の最大は原点からの距離の2乗：最も遠い点を探す（頂点とは限らない）。', '等号の有無で境界を含むかが決まる。'],
    },
    followups: {
      en: ['Walk through the Apollonius circle example fully.', 'Why does the max of a linear expression happen at a vertex?', 'Give me a region problem to sketch.'],
      ja: ['アポロニウスの円の例を最後までやって。', '1次式の最大が頂点で起こる理由は？', '領域を描く問題を1問出して。'],
    },
  },

  // ───────────────────────────── TRIGONOMETRIC FUNCTIONS ───────────────────
  {
    id: 'trig-general-graphs',
    core: {
      en: 'Radians measure an angle by arc length on the unit circle: $180° = \\pi$. $\\sin$ and $\\cos$ are the $y$ and $x$ of a point going round the circle, so their graphs are waves with period $2\\pi$; $\\tan$ repeats every $\\pi$.',
      ja: '弧度法は単位円の弧の長さで角を測る：$180° = \\pi$。$\\sin$、$\\cos$ は円を回る点の $y$、$x$ なのでグラフは周期 $2\\pi$ の波。$\\tan$ は周期 $\\pi$。',
    },
    body: {
      en: r`## Radians
$180° = \pi$, so $30° = \dfrac\pi6$, $45° = \dfrac\pi4$, $60° = \dfrac\pi3$, $90° = \dfrac\pi2$.
Arc length $l = r\theta$, sector area $S = \dfrac12 r^2\theta$ (θ in radians).

## General angles
$\theta + 2n\pi$ lands on the same point: $\sin(\theta + 2n\pi) = \sin\theta$.
Sign by quadrant: I (+,+), II ($\sin$+), III ($\tan$+), IV ($\cos$+).
Related angles: $\sin(-\theta) = -\sin\theta$, $\cos(-\theta) = \cos\theta$, $\sin(\pi - \theta) = \sin\theta$, $\cos(\pi - \theta) = -\cos\theta$, $\sin\left(\frac\pi2 - \theta\right) = \cos\theta$, $\sin(\theta + \pi) = -\sin\theta$.

## Graphs
| function | period | range |
|---|---|---|
| $\sin x$, $\cos x$ | $2\pi$ | $[-1, 1]$ |
| $\tan x$ | $\pi$ | all reals (asymptotes at $x = \frac\pi2 + n\pi$) |

$y = a\sin(bx + c) + d$: amplitude $|a|$, period $\dfrac{2\pi}{|b|}$, shifted left by $\dfrac cb$, up by $d$.

## Equations on an interval
$\sin x = \dfrac12$ on $0 \le x < 2\pi$: draw the circle, mark height $\frac12$: $x = \dfrac\pi6, \dfrac{5\pi}6$.
Inequalities: shade the arc where the condition holds and read the angle range.

> Convert degrees ↔ radians by multiplying by $\frac{\pi}{180}$ or $\frac{180}{\pi}$; keep exact fractions of $\pi$.`,
      ja: r`## 弧度法
$180° = \pi$。$30° = \dfrac\pi6$、$45° = \dfrac\pi4$、$60° = \dfrac\pi3$、$90° = \dfrac\pi2$。
弧の長さ $l = r\theta$、扇形の面積 $S = \dfrac12 r^2\theta$（θ はラジアン）。

## 一般角
$\theta + 2n\pi$ は同じ点：$\sin(\theta + 2n\pi) = \sin\theta$。
象限の符号：I (+,+)、II（$\sin$ が+）、III（$\tan$ が+）、IV（$\cos$ が+）。
関連する角：$\sin(-\theta) = -\sin\theta$、$\cos(-\theta) = \cos\theta$、$\sin(\pi - \theta) = \sin\theta$、$\cos(\pi - \theta) = -\cos\theta$、$\sin\left(\frac\pi2 - \theta\right) = \cos\theta$、$\sin(\theta + \pi) = -\sin\theta$。

## グラフ
| 関数 | 周期 | 値域 |
|---|---|---|
| $\sin x$、$\cos x$ | $2\pi$ | $[-1, 1]$ |
| $\tan x$ | $\pi$ | 実数全体（$x = \frac\pi2 + n\pi$ が漸近線） |

$y = a\sin(bx + c) + d$：振幅 $|a|$、周期 $\dfrac{2\pi}{|b|}$、$x$ 方向に $-\dfrac cb$、$y$ 方向に $d$ 移動。

## 区間での方程式
$0 \le x < 2\pi$ で $\sin x = \dfrac12$：円を描いて高さ $\frac12$ に印：$x = \dfrac\pi6, \dfrac{5\pi}6$。
不等式：条件を満たす弧を塗って角の範囲を読む。

> 度とラジアンは $\frac{\pi}{180}$、$\frac{180}{\pi}$ をかけて変換。$\pi$ の分数のまま扱う。`,
    },
    exam: {
      en: ['Solve $\\sin 2x = \\frac{\\sqrt3}{2}$ on $0 \\le x < 2\\pi$ (substitute $t = 2x$, widen the interval).', 'Read period and amplitude from a graph and write its equation.', 'Simplify $\\sin(\\pi + \\theta) + \\cos(\\frac{\\pi}{2} - \\theta)$.'],
      ja: ['$0 \\le x < 2\\pi$ で $\\sin 2x = \\frac{\\sqrt3}{2}$（$t = 2x$ とおき区間を2倍）。', 'グラフから周期と振幅を読み、式を書く。', '$\\sin(\\pi + \\theta) + \\cos(\\frac{\\pi}{2} - \\theta)$ を簡単に。'],
    },
    traps: {
      en: ['With $t = 2x$ the interval for $t$ is $0 \\le t < 4\\pi$ — you get twice as many solutions.', 'Period of $\\sin 2x$ is $\\pi$, not $4\\pi$.', 'Sector formulas need radians; using degrees gives nonsense.'],
      ja: ['$t = 2x$ なら $t$ の範囲は $0 \\le t < 4\\pi$。解は2倍出る。', '$\\sin 2x$ の周期は $\\pi$。$4\\pi$ ではない。', '扇形の公式はラジアン専用。度で計算すると崩れる。'],
    },
    followups: {
      en: ['Why is $180° = \\pi$ radians?', 'Show me how to sketch $y = 2\\sin(2x - \\frac{\\pi}{3})$.', 'Quiz me on solving trig equations on an interval.'],
      ja: ['$180° = \\pi$ ラジアンになる理由は？', '$y = 2\\sin(2x - \\frac{\\pi}{3})$ のグラフの描き方を見せて。', '区間での三角方程式のミニテストを出して。'],
    },
  },
  {
    id: 'addition-formulas',
    core: {
      en: 'One formula family runs everything: the addition formulas. Double-angle, half-angle and $a\\sin\\theta + b\\cos\\theta = r\\sin(\\theta + \\alpha)$ are all the addition formula read in a particular way.',
      ja: '加法定理ひとつで全部回る。2倍角・半角・三角関数の合成 $a\\sin\\theta + b\\cos\\theta = r\\sin(\\theta + \\alpha)$ は、加法定理を特定の形で読んだだけ。',
    },
    body: {
      en: r`## Addition formulas
$$\sin(\alpha \pm \beta) = \sin\alpha\cos\beta \pm \cos\alpha\sin\beta, \qquad \cos(\alpha \pm \beta) = \cos\alpha\cos\beta \mp \sin\alpha\sin\beta$$
$$\tan(\alpha \pm \beta) = \frac{\tan\alpha \pm \tan\beta}{1 \mp \tan\alpha\tan\beta}$$
Use: $\sin 75° = \sin(45° + 30°)$; the angle between two lines from their gradients ($\tan$ formula).

## Double and half angle (set $\beta = \alpha$)
$\sin 2\alpha = 2\sin\alpha\cos\alpha$, $\cos 2\alpha = \cos^2\alpha - \sin^2\alpha = 1 - 2\sin^2\alpha = 2\cos^2\alpha - 1$.
Half angle: $\sin^2\dfrac\alpha2 = \dfrac{1 - \cos\alpha}{2}$, $\cos^2\dfrac\alpha2 = \dfrac{1 + \cos\alpha}{2}$.
The $\cos 2\alpha$ forms convert between $\sin^2$ and $\cos^2$ — the key to turning an equation into one function.

## Synthesis (合成)
$$a\sin\theta + b\cos\theta = \sqrt{a^2 + b^2}\,\sin(\theta + \alpha), \quad \cos\alpha = \frac{a}{\sqrt{a^2+b^2}},\ \sin\alpha = \frac{b}{\sqrt{a^2+b^2}}$$
So $\sin\theta + \sqrt3\cos\theta = 2\sin\left(\theta + \dfrac\pi3\right)$: max 2, min $-2$.

## Max/min of trig expressions
- Only $\sin$ and $\cos$ to the first power → synthesise.
- $\sin^2$ and $\cos$ mixed → replace $\sin^2 = 1 - \cos^2$, set $t = \cos\theta$ with $-1 \le t \le 1$, then it is a quadratic in $t$.

> Before any manipulation, decide: same angle or different angles? Different → addition formula; same → double-angle or synthesis.`,
      ja: r`## 加法定理
$$\sin(\alpha \pm \beta) = \sin\alpha\cos\beta \pm \cos\alpha\sin\beta, \qquad \cos(\alpha \pm \beta) = \cos\alpha\cos\beta \mp \sin\alpha\sin\beta$$
$$\tan(\alpha \pm \beta) = \frac{\tan\alpha \pm \tan\beta}{1 \mp \tan\alpha\tan\beta}$$
使い方：$\sin 75° = \sin(45° + 30°)$、2直線のなす角（傾きから $\tan$ の公式）。

## 2倍角・半角（$\beta = \alpha$ とおく）
$\sin 2\alpha = 2\sin\alpha\cos\alpha$、$\cos 2\alpha = \cos^2\alpha - \sin^2\alpha = 1 - 2\sin^2\alpha = 2\cos^2\alpha - 1$。
半角：$\sin^2\dfrac\alpha2 = \dfrac{1 - \cos\alpha}{2}$、$\cos^2\dfrac\alpha2 = \dfrac{1 + \cos\alpha}{2}$。
$\cos 2\alpha$ の3つの形は $\sin^2$ と $\cos^2$ を行き来する道具——式を1種類の関数にそろえる鍵。

## 合成
$$a\sin\theta + b\cos\theta = \sqrt{a^2 + b^2}\,\sin(\theta + \alpha), \quad \cos\alpha = \frac{a}{\sqrt{a^2+b^2}},\ \sin\alpha = \frac{b}{\sqrt{a^2+b^2}}$$
$\sin\theta + \sqrt3\cos\theta = 2\sin\left(\theta + \dfrac\pi3\right)$：最大2、最小 $-2$。

## 三角関数の最大最小
- $\sin$、$\cos$ の1次だけ → 合成。
- $\sin^2$ と $\cos$ が混ざる → $\sin^2 = 1 - \cos^2$ で置き換え、$t = \cos\theta$（$-1 \le t \le 1$）の2次関数にする。

> 手を動かす前に「同じ角か、違う角か」を見る。違う角 → 加法定理、同じ角 → 2倍角か合成。`,
    },
    exam: {
      en: ['Max and min of $y = \\sin\\theta + \\sqrt3\\cos\\theta$ or $y = \\cos 2\\theta + 2\\sin\\theta$ on an interval.', 'Solve $\\sin 2\\theta = \\cos\\theta$ (factor: $\\cos\\theta(2\\sin\\theta - 1) = 0$).', 'Exact values like $\\sin 15°$, or $\\tan$ of the angle between two lines.'],
      ja: ['区間での $y = \\sin\\theta + \\sqrt3\\cos\\theta$、$y = \\cos 2\\theta + 2\\sin\\theta$ の最大最小。', '$\\sin 2\\theta = \\cos\\theta$（$\\cos\\theta(2\\sin\\theta - 1) = 0$ と因数分解）。', '$\\sin 15°$ の値、2直線のなす角の $\\tan$。'],
    },
    traps: {
      en: ['$\\sin(\\alpha + \\beta) \\ne \\sin\\alpha + \\sin\\beta$.', 'When you substitute $t = \\sin\\theta$, carry the restriction $-1 \\le t \\le 1$ (or the tighter range from the interval).', 'In synthesis the angle $\\alpha$ is found from BOTH $\\cos\\alpha$ and $\\sin\\alpha$, so the quadrant is right.'],
      ja: ['$\\sin(\\alpha + \\beta) \\ne \\sin\\alpha + \\sin\\beta$。', '$t = \\sin\\theta$ とおいたら $-1 \\le t \\le 1$（区間があればもっと狭い範囲）を忘れない。', '合成の $\\alpha$ は $\\cos\\alpha$ と $\\sin\\alpha$ の**両方**から決める。象限を間違えない。'],
    },
    followups: {
      en: ['Derive $\\cos 2\\alpha$ from the addition formula.', 'Show synthesis on $\\sin\\theta - \\cos\\theta$ step by step.', 'Give me a max/min problem mixing $\\sin^2$ and $\\cos$.'],
      ja: ['加法定理から $\\cos 2\\alpha$ を導いて。', '$\\sin\\theta - \\cos\\theta$ の合成を手順ごとに。', '$\\sin^2$ と $\\cos$ が混ざる最大最小の問題を1問。'],
    },
  },

  // ───────────────────────────── EXPONENTIALS AND LOGARITHMS ───────────────────
  {
    id: 'exponentials',
    core: {
      en: 'The exponent rules are the whole story: multiply → add exponents, power of a power → multiply exponents, roots are fractional exponents. To solve $2^x = 8$, write both sides with the same base.',
      ja: '指数法則が全部：かけ算は指数の足し算、累乗の累乗は指数のかけ算、累乗根は分数の指数。$2^x = 8$ を解くには両辺を同じ底にそろえる。',
    },
    body: {
      en: r`## Rules ($a > 0$)
$$a^m a^n = a^{m+n}, \quad \frac{a^m}{a^n} = a^{m-n}, \quad (a^m)^n = a^{mn}, \quad (ab)^n = a^n b^n$$
$$a^0 = 1, \qquad a^{-n} = \frac1{a^n}, \qquad a^{\frac mn} = \sqrt[n]{a^m}$$
So $\sqrt[3]{4} = 2^{2/3}$ and $8^{-\frac23} = (2^3)^{-\frac23} = 2^{-2} = \dfrac14$.

## Comparing sizes
Write everything as powers of one base: $\sqrt[3]{4} = 2^{0.67}$, $\sqrt2 = 2^{0.5}$, $8^{0.2} = 2^{0.6}$ → order by exponent.
If the base is between 0 and 1, bigger exponent means **smaller** value.

## The function $y = a^x$
Always positive, passes through $(0, 1)$. Increasing if $a > 1$, decreasing if $0 < a < 1$.
$y = a^{-x}$ is the mirror image in the $y$-axis.

## Equations and inequalities
- $4^x - 3\cdot2^x - 4 = 0$: let $t = 2^x$ ($t > 0$): $t^2 - 3t - 4 = 0$, $t = 4$, so $x = 2$ (reject $t = -1$).
- $\left(\frac12\right)^x < \frac18$: rewrite as $2^{-x} < 2^{-3}$, so $-x < -3$, $x > 3$. Compare exponents; flip if $0 < a < 1$.

> Whenever you see $4^x$, $8^x$, $\sqrt{2}^x$: everything is a power of 2.`,
      ja: r`## 指数法則（$a > 0$）
$$a^m a^n = a^{m+n}, \quad \frac{a^m}{a^n} = a^{m-n}, \quad (a^m)^n = a^{mn}, \quad (ab)^n = a^n b^n$$
$$a^0 = 1, \qquad a^{-n} = \frac1{a^n}, \qquad a^{\frac mn} = \sqrt[n]{a^m}$$
$\sqrt[3]{4} = 2^{2/3}$、$8^{-\frac23} = (2^3)^{-\frac23} = 2^{-2} = \dfrac14$。

## 大小比較
底をそろえる：$\sqrt[3]{4} = 2^{0.67}$、$\sqrt2 = 2^{0.5}$、$8^{0.2} = 2^{0.6}$ → 指数の大きさで並べる。
底が0と1の間なら、指数が大きいほど値は**小さい**。

## 関数 $y = a^x$
つねに正、$(0, 1)$ を通る。$a > 1$ で増加、$0 < a < 1$ で減少。
$y = a^{-x}$ は $y$ 軸に関して対称なグラフ。

## 方程式・不等式
- $4^x - 3\cdot2^x - 4 = 0$：$t = 2^x$（$t > 0$）とおくと $t^2 - 3t - 4 = 0$、$t = 4$、よって $x = 2$（$t = -1$ は不適）。
- $\left(\frac12\right)^x < \frac18$：$2^{-x} < 2^{-3}$ と書き直して $-x < -3$、$x > 3$。指数を比べ、底が $0 < a < 1$ なら不等号を逆に。

> $4^x$、$8^x$、$\sqrt{2}^x$ を見たら、全部2の累乗。`,
    },
    exam: {
      en: ['Order three numbers like $\\sqrt[3]{3}, \\sqrt[4]{5}, \\sqrt{2}$ (raise all to the 12th power).', 'Solve $9^x - 4\\cdot3^x + 3 = 0$ via $t = 3^x$.', 'Max/min of $y = 4^x - 2^{x+2} + 5$ on an interval using $t = 2^x$ with its own range.'],
      ja: ['$\\sqrt[3]{3}, \\sqrt[4]{5}, \\sqrt{2}$ の大小（全部12乗する）。', '$t = 3^x$ で $9^x - 4\\cdot3^x + 3 = 0$ を解く。', '$t = 2^x$（$t$ の範囲つき）で $y = 4^x - 2^{x+2} + 5$ の最大最小。'],
    },
    traps: {
      en: ['$t = a^x$ is always positive; negative roots for $t$ must be rejected.', 'Base between 0 and 1 flips the inequality when comparing exponents.', '$2^{x+2} = 4 \\cdot 2^x$, not $2^x + 4$.'],
      ja: ['$t = a^x$ はつねに正。$t$ の負の解は捨てる。', '底が0と1の間なら指数を比べるとき不等号が逆。', '$2^{x+2} = 4 \\cdot 2^x$ であって $2^x + 4$ ではない。'],
    },
    followups: {
      en: ['Why does $a^{1/2}$ mean the square root?', 'Show the substitution method on $4^x + 2^x - 6 = 0$.', 'Quiz me on comparing powers.'],
      ja: ['$a^{1/2}$ が平方根になる理由は？', '$4^x + 2^x - 6 = 0$ をおきかえで解いて。', '累乗の大小比較のミニテストを出して。'],
    },
  },
  {
    id: 'logarithms',
    core: {
      en: '$\\log_a M$ answers "which power of $a$ gives $M$?" — it is an exponent. So logs turn multiplication into addition and powers into multiplication. Common logs ($\\log_{10}$) count digits.',
      ja: '$\\log_a M$ は「$a$ を何乗すると $M$ になるか」——つまり指数。だから対数はかけ算を足し算に、累乗をかけ算に変える。常用対数（$\\log_{10}$）は桁数を数える。',
    },
    body: {
      en: r`## Definition and rules ($a > 0, a \ne 1, M, N > 0$)
$$a^p = M \iff p = \log_a M$$
$$\log_a MN = \log_a M + \log_a N, \quad \log_a \frac MN = \log_a M - \log_a N, \quad \log_a M^k = k\log_a M$$
$\log_a a = 1$, $\log_a 1 = 0$. Change of base: $\log_a b = \dfrac{\log_c b}{\log_c a}$, so $\log_a b \cdot \log_b a = 1$.

## The function $y = \log_a x$
Defined only for $x > 0$; passes through $(1, 0)$; increasing for $a > 1$, decreasing for $0 < a < 1$. It is the reflection of $y = a^x$ in $y = x$.

## Equations and inequalities
1. Write the **domain** first (every log argument $> 0$).
2. Combine into a single log on each side, then compare arguments (flip the inequality if $0 < a < 1$).
$\log_2(x-1) + \log_2(x+2) = 2$: domain $x > 1$; $(x-1)(x+2) = 4$; $x = 2$ (reject $x = -3$).
Quadratics in $\log$: let $t = \log_2 x$.

## Common logs and digit counting
$\log_{10} 2 \approx 0.3010$, $\log_{10} 3 \approx 0.4771$.
$N$ has $k$ digits $\iff k - 1 \le \log_{10} N < k$. For $2^{50}$: $50 \times 0.3010 = 15.05$ → 16 digits.
First digit: look at the fractional part ($10^{0.05} \approx 1.12$ → starts with 1).

> The number one lost mark in logs is a missing domain. Write it before anything else.`,
      ja: r`## 定義と法則（$a > 0, a \ne 1, M, N > 0$）
$$a^p = M \iff p = \log_a M$$
$$\log_a MN = \log_a M + \log_a N, \quad \log_a \frac MN = \log_a M - \log_a N, \quad \log_a M^k = k\log_a M$$
$\log_a a = 1$、$\log_a 1 = 0$。底の変換：$\log_a b = \dfrac{\log_c b}{\log_c a}$、よって $\log_a b \cdot \log_b a = 1$。

## 関数 $y = \log_a x$
$x > 0$ でだけ定義。$(1, 0)$ を通る。$a > 1$ で増加、$0 < a < 1$ で減少。$y = a^x$ を $y = x$ に関して折り返したもの。

## 方程式・不等式
1. まず**真数条件**（すべての真数 $> 0$）を書く。
2. 各辺を1つの対数にまとめ、真数を比べる（$0 < a < 1$ なら不等号を逆に）。
$\log_2(x-1) + \log_2(x+2) = 2$：真数条件 $x > 1$、$(x-1)(x+2) = 4$、$x = 2$（$x = -3$ は不適）。
対数の2次式：$t = \log_2 x$ とおく。

## 常用対数と桁数
$\log_{10} 2 \approx 0.3010$、$\log_{10} 3 \approx 0.4771$。
$N$ が $k$ 桁 $\iff k - 1 \le \log_{10} N < k$。$2^{50}$：$50 \times 0.3010 = 15.05$ → 16桁。
最高位の数字：小数部分を見る（$10^{0.05} \approx 1.12$ → 1で始まる）。

> 対数で一番多い失点は真数条件の書き忘れ。最初に書く。`,
    },
    exam: {
      en: ['Number of digits of $3^{40}$ or $6^{30}$ from $\\log_{10}2, \\log_{10}3$; also the first digit.', 'Solve $\\log_2 x + \\log_2(x - 2) = 3$ with the domain.', 'Max/min of $(\\log_2 x)^2 - \\log_2 x^4$ on an interval with $t = \\log_2 x$.'],
      ja: ['$\\log_{10}2, \\log_{10}3$ から $3^{40}$、$6^{30}$ の桁数と最高位の数字。', '真数条件つきで $\\log_2 x + \\log_2(x - 2) = 3$ を解く。', '$t = \\log_2 x$ で $(\\log_2 x)^2 - \\log_2 x^4$ の最大最小。'],
    },
    traps: {
      en: ['$\\log(M + N)$ has no rule; only products and quotients split.', 'Forgetting the domain lets in false solutions like $x = -3$.', '$\\log_a x^2 = 2\\log_a |x|$, not $2\\log_a x$ when $x$ could be negative.'],
      ja: ['$\\log(M + N)$ は分解できない。積と商だけ。', '真数条件を忘れると $x = -3$ のような偽の解が混ざる。', '$x$ が負になりうるとき $\\log_a x^2 = 2\\log_a |x|$。'],
    },
    followups: {
      en: ['Explain why $\\log$ of a product is a sum, using exponents.', 'Show the digit-count method on $5^{20}$.', 'Quiz me on log equations with domains.'],
      ja: ['積の対数が和になる理由を指数で説明して。', '$5^{20}$ の桁数の求め方を見せて。', '真数条件つき対数方程式のミニテストを出して。'],
    },
  },

  // ───────────────────────────── DIFFERENTIATION AND INTEGRATION ───────────────────
  {
    id: 'differentiation',
    core: {
      en: 'The derivative $f\'(x)$ is the gradient of the graph at $x$. Where $f\' > 0$ the graph climbs, where $f\' < 0$ it falls, and $f\' = 0$ marks the turning points. Make the sign table and the whole shape appears.',
      ja: '導関数 $f\'(x)$ はグラフの $x$ での傾き。$f\' > 0$ で上り、$f\' < 0$ で下り、$f\' = 0$ が山と谷。増減表を書けば形が全部見える。',
    },
    body: {
      en: r`## Rules
$(x^n)' = nx^{n-1}$, $(c)' = 0$, $(f + g)' = f' + g'$, $(kf)' = kf'$.
$f(x) = x^3 - 3x^2 + 2 \Rightarrow f'(x) = 3x^2 - 6x = 3x(x-2)$.
Definition (for the derivation questions): $f'(a) = \lim_{h\to0}\dfrac{f(a+h) - f(a)}{h}$.

## Tangent line
At $x = a$: $y - f(a) = f'(a)(x - a)$.
Tangent from an outside point $(p, q)$: let the touch point be $(t, f(t))$, write the tangent, substitute $(p, q)$, solve for $t$.

## Sign table (増減表)
| $x$ | … | 0 | … | 2 | … |
|---|---|---|---|---|---|
| $f'$ | + | 0 | − | 0 | + |
| $f$ | ↗ | 2 (max) | ↘ | −2 (min) | ↗ |

Local max where $f'$ goes + → −, local min where − → +.
Max/min on an interval: compare local extrema **inside** the interval with the endpoint values.

## Number of real solutions of $f(x) = k$
Draw $y = f(x)$ using the table; count how many times the horizontal line $y = k$ crosses it. "Three distinct real roots" ⟺ $k$ strictly between the local min and max values.

> $f'(a) = 0$ alone does not guarantee an extremum ($x^3$ at 0). The sign must change.`,
      ja: r`## 公式
$(x^n)' = nx^{n-1}$、$(c)' = 0$、$(f + g)' = f' + g'$、$(kf)' = kf'$。
$f(x) = x^3 - 3x^2 + 2 \Rightarrow f'(x) = 3x^2 - 6x = 3x(x-2)$。
定義（導出問題用）：$f'(a) = \lim_{h\to0}\dfrac{f(a+h) - f(a)}{h}$。

## 接線
$x = a$ で：$y - f(a) = f'(a)(x - a)$。
外部の点 $(p, q)$ からの接線：接点を $(t, f(t))$ とおいて接線を書き、$(p, q)$ を代入して $t$ を解く。

## 増減表
| $x$ | … | 0 | … | 2 | … |
|---|---|---|---|---|---|
| $f'$ | + | 0 | − | 0 | + |
| $f$ | ↗ | 2（極大） | ↘ | −2（極小） | ↗ |

$f'$ が + → − で極大、− → + で極小。
区間の最大最小：区間**内**の極値と端の値を比べる。

## $f(x) = k$ の実数解の個数
増減表から $y = f(x)$ を描き、水平線 $y = k$ との交点の数を数える。「異なる3つの実数解」⟺ $k$ が極小値と極大値の間（等号なし）。

> $f'(a) = 0$ だけでは極値とは限らない（$x^3$ の $x = 0$）。符号が変わることが条件。`,
    },
    exam: {
      en: ['Sign table → local max/min → max/min of a cubic on an interval.', 'Condition on $a$ for $f(x) = x^3 - 3ax + 1$ to have three distinct real roots.', 'Tangent from an external point to a cubic; area between tangent and curve follows.'],
      ja: ['増減表 → 極値 → 区間での3次関数の最大最小。', '$f(x) = x^3 - 3ax + 1$ が異なる3つの実数解をもつ $a$ の条件。', '外部の点から3次曲線への接線、続いて接線と曲線で囲む面積。'],
    },
    traps: {
      en: ['Local max is not necessarily the global max on an interval — check the endpoints.', 'A cubic with $a \\le 0$ in $x^3 - 3ax$ has no extrema (the derivative never changes sign).', 'The tangent at a point vs from a point are different setups.'],
      ja: ['極大＝区間の最大とは限らない。端も確認。', '$x^3 - 3ax$ で $a \\le 0$ なら極値なし（$f\'$ の符号が変わらない）。', '「点における接線」と「点を通る接線」は別の設定。'],
    },
    followups: {
      en: ['Why is the derivative the gradient? Show the limit picture.', 'Walk me through a sign table on $f(x) = -x^3 + 3x$.', 'Give me a "number of real roots" problem.'],
      ja: ['導関数が傾きになる理由を極限の絵で見せて。', '$f(x) = -x^3 + 3x$ の増減表を一緒に作って。', '実数解の個数の問題を1問出して。'],
    },
  },
  {
    id: 'integration',
    core: {
      en: 'Integration undoes differentiation: $\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C$. A definite integral $\\int_a^b f\\,dx$ is the signed area under the graph, so area between curves is $\\int (\\text{upper} - \\text{lower})$.',
      ja: '積分は微分の逆：$\\int x^n\\,dx = \\dfrac{x^{n+1}}{n+1} + C$。定積分 $\\int_a^b f\\,dx$ は符号つきの面積なので、2曲線の間の面積は $\\int (\\text{上} - \\text{下})$。',
    },
    body: {
      en: r`## Antiderivatives
$\int x^n\,dx = \dfrac{x^{n+1}}{n+1} + C$; integrate term by term. Always add $+C$ for an indefinite integral.

## Definite integrals
$$\int_a^b f(x)\,dx = \Big[F(x)\Big]_a^b = F(b) - F(a)$$
Properties: $\int_a^a = 0$, $\int_b^a = -\int_a^b$, $\int_a^c = \int_a^b + \int_b^c$.
Even/odd on $[-a, a]$: $\int_{-a}^a x^{\text{odd}}\,dx = 0$, $\int_{-a}^a x^{\text{even}}\,dx = 2\int_0^a$.

## Area
- Between the curve and the $x$-axis: where $f < 0$, the integral is negative — split at the roots and take absolute values.
- Between two curves on $[a, b]$: $\int_a^b (\text{upper} - \text{lower})\,dx$. Find $a, b$ by solving $f = g$.

## The 1/6 formula
Parabola $y = ax^2 + \dots$ and a line meeting at $x = \alpha, \beta$:
$$S = \frac{|a|}{6}(\beta - \alpha)^3$$
Saves minutes on every "area between parabola and line" question.

## Functions defined by integrals
$\dfrac{d}{dx}\int_a^x f(t)\,dt = f(x)$. If $f(x) = x^2 + \int_0^1 f(t)\,dt$, the integral is a constant $k$: write $f(x) = x^2 + k$, integrate to find $k$.

> Sketch first, find the crossing points, then decide which graph is on top.`,
      ja: r`## 不定積分
$\int x^n\,dx = \dfrac{x^{n+1}}{n+1} + C$。項ごとに積分。不定積分には必ず $+C$。

## 定積分
$$\int_a^b f(x)\,dx = \Big[F(x)\Big]_a^b = F(b) - F(a)$$
性質：$\int_a^a = 0$、$\int_b^a = -\int_a^b$、$\int_a^c = \int_a^b + \int_b^c$。
$[-a, a]$ での偶関数・奇関数：$\int_{-a}^a x^{奇数}\,dx = 0$、$\int_{-a}^a x^{偶数}\,dx = 2\int_0^a$。

## 面積
- 曲線と $x$ 軸の間：$f < 0$ の部分は積分が負。解で区切って絶対値をとる。
- 2曲線の間（$[a, b]$）：$\int_a^b (\text{上} - \text{下})\,dx$。$f = g$ を解いて $a, b$ を求める。

## 1/6公式
放物線 $y = ax^2 + \dots$ と直線が $x = \alpha, \beta$ で交わるとき
$$S = \frac{|a|}{6}(\beta - \alpha)^3$$
「放物線と直線で囲む面積」で毎回数分節約できる。

## 積分で定義された関数
$\dfrac{d}{dx}\int_a^x f(t)\,dt = f(x)$。$f(x) = x^2 + \int_0^1 f(t)\,dt$ なら積分は定数 $k$：$f(x) = x^2 + k$ とおいて積分し $k$ を決める。

> まずスケッチ、交点を求め、どちらが上か決めてから積分。`,
    },
    exam: {
      en: ['Area between a parabola and a line (1/6 formula), then between parabola and its tangents.', 'Find $f(x)$ from $f(x) = 3x^2 + \\int_0^2 f(t)\\,dt$.', 'Area bounded by a cubic and the $x$-axis, splitting at the roots.'],
      ja: ['放物線と直線で囲む面積（1/6公式）、放物線と2本の接線で囲む面積。', '$f(x) = 3x^2 + \\int_0^2 f(t)\\,dt$ から $f(x)$ を求める。', '3次曲線と $x$ 軸で囲む面積（解で区切る）。'],
    },
    traps: {
      en: ['Area below the axis comes out negative: take the absolute value piece by piece.', 'The 1/6 formula needs the $x^2$ coefficient of the *difference* of the two functions.', 'Reversed limits change the sign.'],
      ja: ['$x$ 軸の下の面積は負で出る。区間ごとに絶対値。', '1/6公式の $a$ は2つの関数の**差**の $x^2$ の係数。', '積分区間を逆にすると符号が変わる。'],
    },
    followups: {
      en: ['Why is the integral an area?', 'Prove the 1/6 formula.', 'Give me an area problem with two crossing curves.'],
      ja: ['積分が面積になる理由は？', '1/6公式を証明して。', '2曲線が交わる面積の問題を1問出して。'],
    },
  },

  // ───────────────────────────── SEQUENCES ───────────────────
  {
    id: 'arithmetic-geometric',
    core: {
      en: 'Arithmetic: add the same number each step, so $a_n = a + (n-1)d$. Geometric: multiply by the same number, so $a_n = ar^{n-1}$. Sums come from pairing terms (arithmetic) or the shift-and-subtract trick (geometric).',
      ja: '等差：毎回同じ数をたす → $a_n = a + (n-1)d$。等比：毎回同じ数をかける → $a_n = ar^{n-1}$。和は、等差なら「両端をペアにする」、等比なら「$r$ 倍してずらして引く」で出る。',
    },
    body: {
      en: r`## Formulas
| | $n$-th term | sum of first $n$ terms |
|---|---|---|
| arithmetic | $a_n = a + (n-1)d$ | $S_n = \dfrac{n(a_1 + a_n)}{2} = \dfrac{n\{2a + (n-1)d\}}{2}$ |
| geometric | $a_n = ar^{n-1}$ | $S_n = \dfrac{a(r^n - 1)}{r - 1}$ ($r \ne 1$) |

Arithmetic mean: $b$ between $a, c$ ⟺ $2b = a + c$. Geometric: $b^2 = ac$.

## Sigma
$$\sum_{k=1}^n k = \frac{n(n+1)}{2}, \quad \sum_{k=1}^n k^2 = \frac{n(n+1)(2n+1)}{6}, \quad \sum_{k=1}^n k^3 = \left\{\frac{n(n+1)}{2}\right\}^2, \quad \sum_{k=1}^n c = cn$$
Split sums term by term: $\sum (2k^2 - k + 3) = 2\sum k^2 - \sum k + 3n$.

## From $S_n$ to $a_n$
$a_1 = S_1$, and $a_n = S_n - S_{n-1}$ for $n \ge 2$. Check whether $n = 1$ fits the formula separately.

## Difference sequences (階差数列)
If $b_n = a_{n+1} - a_n$ is known: $a_n = a_1 + \sum_{k=1}^{n-1} b_k$ for $n \ge 2$.

## Telescoping and the $r$ trick
$\sum \dfrac{1}{k(k+1)} = \sum\left(\dfrac1k - \dfrac1{k+1}\right) = 1 - \dfrac{1}{n+1}$.
$S = \sum k r^{k}$: compute $S - rS$, which becomes a geometric sum.

> Write out the first three terms of any sum before using a formula; it exposes what $k$ starts at.`,
      ja: r`## 公式
| | 第 $n$ 項 | 初項から第 $n$ 項までの和 |
|---|---|---|
| 等差 | $a_n = a + (n-1)d$ | $S_n = \dfrac{n(a_1 + a_n)}{2} = \dfrac{n\{2a + (n-1)d\}}{2}$ |
| 等比 | $a_n = ar^{n-1}$ | $S_n = \dfrac{a(r^n - 1)}{r - 1}$（$r \ne 1$） |

等差中項：$2b = a + c$。等比中項：$b^2 = ac$。

## Σ
$$\sum_{k=1}^n k = \frac{n(n+1)}{2}, \quad \sum_{k=1}^n k^2 = \frac{n(n+1)(2n+1)}{6}, \quad \sum_{k=1}^n k^3 = \left\{\frac{n(n+1)}{2}\right\}^2, \quad \sum_{k=1}^n c = cn$$
項ごとに分ける：$\sum (2k^2 - k + 3) = 2\sum k^2 - \sum k + 3n$。

## $S_n$ から $a_n$
$a_1 = S_1$、$n \ge 2$ で $a_n = S_n - S_{n-1}$。$n = 1$ が式に合うか別に確認。

## 階差数列
$b_n = a_{n+1} - a_n$ がわかれば、$n \ge 2$ で $a_n = a_1 + \sum_{k=1}^{n-1} b_k$。

## 部分分数と $r$ 倍ずらし
$\sum \dfrac{1}{k(k+1)} = \sum\left(\dfrac1k - \dfrac1{k+1}\right) = 1 - \dfrac{1}{n+1}$。
$S = \sum k r^{k}$：$S - rS$ を計算すると等比の和になる。

> 公式を使う前に最初の3項を書き出す。$k$ がどこから始まるかが見える。`,
    },
    exam: {
      en: ['Arithmetic sequence from two given terms, then the $n$ that maximises $S_n$ (where terms turn negative).', '$\\sum$ of a polynomial in $k$; sum of $k \\cdot 2^k$ by the shift trick.', 'Find $a_n$ from $S_n = n^2 + 2n$ (check $n = 1$).'],
      ja: ['2つの項から等差数列を決め、$S_n$ が最大になる $n$（項が負になる手前）。', '$k$ の多項式の Σ、$k \\cdot 2^k$ の和（ずらして引く）。', '$S_n = n^2 + 2n$ から $a_n$（$n = 1$ を確認）。'],
    },
    traps: {
      en: ['$\\sum_{k=1}^n$ has $n$ terms; $\\sum_{k=0}^n$ has $n+1$.', 'Geometric sum formula fails when $r = 1$ (then $S_n = na$).', '$a_n = S_n - S_{n-1}$ is only for $n \\ge 2$.'],
      ja: ['$\\sum_{k=1}^n$ は $n$ 項、$\\sum_{k=0}^n$ は $n+1$ 項。', '等比の和の公式は $r = 1$ で使えない（$S_n = na$）。', '$a_n = S_n - S_{n-1}$ は $n \\ge 2$ のときだけ。'],
    },
    followups: {
      en: ['Derive the arithmetic sum formula by pairing.', 'Show the $S - rS$ trick on $\\sum k \\cdot 2^k$.', 'Quiz me on Σ calculations.'],
      ja: ['等差数列の和の公式をペアにして導いて。', '$\\sum k \\cdot 2^k$ で $S - rS$ の方法を見せて。', 'Σ計算のミニテストを出して。'],
    },
  },
  {
    id: 'recurrence-induction',
    core: {
      en: 'A recurrence tells you how to get the next term from the current one. Turn $a_{n+1} = pa_n + q$ into a geometric sequence by subtracting the fixed point $\\alpha$ (where $\\alpha = p\\alpha + q$). Induction proves a statement for all $n$ in two steps: it holds at $n=1$, and each case implies the next.',
      ja: '漸化式は「今の項から次の項を作る規則」。$a_{n+1} = pa_n + q$ は、不動点 $\\alpha$（$\\alpha = p\\alpha + q$）を引くと等比数列になる。数学的帰納法は2段：$n=1$ で成り立つ、各 $n$ で成り立てば次でも成り立つ。',
    },
    body: {
      en: r`## Recognise the type
| recurrence | it is | solution |
|---|---|---|
| $a_{n+1} = a_n + d$ | arithmetic | $a_n = a_1 + (n-1)d$ |
| $a_{n+1} = ra_n$ | geometric | $a_n = a_1 r^{n-1}$ |
| $a_{n+1} = a_n + f(n)$ | difference sequence | $a_n = a_1 + \sum_{k=1}^{n-1} f(k)$ |
| $a_{n+1} = pa_n + q$ | shift to geometric | below |

## $a_{n+1} = pa_n + q$ (the main one)
1. Solve $\alpha = p\alpha + q$ (the "characteristic" value).
2. Subtract: $a_{n+1} - \alpha = p(a_n - \alpha)$, so $\{a_n - \alpha\}$ is geometric with ratio $p$.
3. $a_n - \alpha = (a_1 - \alpha)p^{n-1}$.
Example: $a_{n+1} = 3a_n - 2$, $a_1 = 2$: $\alpha = 1$, $a_n - 1 = 1 \cdot 3^{n-1}$, so $a_n = 3^{n-1} + 1$.

Variants: $a_{n+1} = pa_n + q^n$ → divide by $q^{n+1}$; $a_{n+1} = \dfrac{a_n}{a_n + 2}$ → take reciprocals $b_n = 1/a_n$.

## Mathematical induction
To prove $P(n)$ for all $n \ge 1$:
1. **Base**: check $P(1)$.
2. **Step**: assume $P(k)$; show $P(k+1)$ — write clearly where you used the assumption.
Conclude: therefore $P(n)$ holds for all $n$.
Typical: $1 + 2 + \dots + n = \dfrac{n(n+1)}2$; $n^3 + 2n$ is divisible by 3; inequalities like $2^n > n^2$ for $n \ge 5$ (base case is 5).

> When guessing a formula from a recurrence, compute $a_1, a_2, a_3, a_4$ first, guess, then prove by induction.`,
      ja: r`## 型を見分ける
| 漸化式 | 正体 | 解 |
|---|---|---|
| $a_{n+1} = a_n + d$ | 等差 | $a_n = a_1 + (n-1)d$ |
| $a_{n+1} = ra_n$ | 等比 | $a_n = a_1 r^{n-1}$ |
| $a_{n+1} = a_n + f(n)$ | 階差 | $a_n = a_1 + \sum_{k=1}^{n-1} f(k)$ |
| $a_{n+1} = pa_n + q$ | ずらして等比 | 下 |

## $a_{n+1} = pa_n + q$（主役）
1. $\alpha = p\alpha + q$ を解く（特性方程式）。
2. 引く：$a_{n+1} - \alpha = p(a_n - \alpha)$。$\{a_n - \alpha\}$ は公比 $p$ の等比数列。
3. $a_n - \alpha = (a_1 - \alpha)p^{n-1}$。
例：$a_{n+1} = 3a_n - 2$、$a_1 = 2$：$\alpha = 1$、$a_n - 1 = 1 \cdot 3^{n-1}$、よって $a_n = 3^{n-1} + 1$。

変形：$a_{n+1} = pa_n + q^n$ → $q^{n+1}$ で割る、$a_{n+1} = \dfrac{a_n}{a_n + 2}$ → 逆数 $b_n = 1/a_n$ をとる。

## 数学的帰納法
すべての $n \ge 1$ で $P(n)$ を示す：
1. **出発点**：$P(1)$ を確認。
2. **ステップ**：$P(k)$ を仮定して $P(k+1)$ を示す——仮定を使った場所を明示。
結論：よってすべての $n$ で $P(n)$ が成り立つ。
典型：$1 + 2 + \dots + n = \dfrac{n(n+1)}2$、$n^3 + 2n$ は3の倍数、$n \ge 5$ で $2^n > n^2$（出発点は5）。

> 漸化式から一般項を推測するときは $a_1, a_2, a_3, a_4$ を計算 → 推測 → 帰納法で証明。`,
    },
    exam: {
      en: ['Solve $a_{n+1} = 2a_n + 3$, then find $S_n$.', 'Recurrence with $q^n$ or a reciprocal substitution.', 'Prove a divisibility or an inequality by induction.'],
      ja: ['$a_{n+1} = 2a_n + 3$ を解き、$S_n$ を求める。', '$q^n$ つき、または逆数をとる漸化式。', '倍数や不等式を帰納法で証明。'],
    },
    traps: {
      en: ['The geometric sequence is $\\{a_n - \\alpha\\}$; do not forget to add $\\alpha$ back.', 'In the induction step you must actually use $P(k)$; a proof that never uses it is wrong.', 'Base case for "$n \\ge 5$" statements is $n = 5$, not 1.'],
      ja: ['等比になるのは $\\{a_n - \\alpha\\}$。最後に $\\alpha$ を戻す。', '帰納法のステップでは $P(k)$ を必ず使う。使わない証明は誤り。', '「$n \\ge 5$」の命題の出発点は $n = 5$。'],
    },
    followups: {
      en: ['Why does subtracting the fixed point make it geometric?', 'Show an induction proof of $n^3 + 2n$ divisible by 3.', 'Give me three recurrences to classify and solve.'],
      ja: ['不動点を引くと等比になる理由は？', '$n^3 + 2n$ が3の倍数であることの帰納法の証明を見せて。', '型を見分けて解く漸化式を3問出して。'],
    },
  },

  // ───────────────────────────── VECTORS ───────────────────
  {
    id: 'vectors-plane',
    core: {
      en: 'A vector is an arrow: direction and length, position does not matter. Add arrows head to tail; the dot product $\\vec a\\cdot\\vec b = |\\vec a||\\vec b|\\cos\\theta$ measures how aligned two arrows are, and equals zero exactly when they are perpendicular.',
      ja: 'ベクトルは矢印：向きと長さだけで、位置は関係ない。足し算は矢印をつなぐ。内積 $\\vec a\\cdot\\vec b = |\\vec a||\\vec b|\\cos\\theta$ は2本の矢印がどれだけ同じ向きかを測り、垂直のときちょうど0。',
    },
    body: {
      en: r`## Components
$\vec a = (a_1, a_2)$: $|\vec a| = \sqrt{a_1^2 + a_2^2}$; $\vec a + \vec b = (a_1 + b_1, a_2 + b_2)$; $k\vec a = (ka_1, ka_2)$.
$\overrightarrow{AB} = \overrightarrow{OB} - \overrightarrow{OA}$ = (end) − (start).
Parallel: $\vec b = k\vec a$ ⟺ $a_1 b_2 - a_2 b_1 = 0$.

## Dot product
$$\vec a\cdot\vec b = |\vec a||\vec b|\cos\theta = a_1 b_1 + a_2 b_2$$
- $\vec a \perp \vec b \iff \vec a\cdot\vec b = 0$.
- $|\vec a|^2 = \vec a\cdot\vec a$, so $|\vec a + \vec b|^2 = |\vec a|^2 + 2\vec a\cdot\vec b + |\vec b|^2$ (expand like algebra).
- Angle: $\cos\theta = \dfrac{\vec a\cdot\vec b}{|\vec a||\vec b|}$.
- Triangle area: $S = \dfrac12\sqrt{|\vec a|^2|\vec b|^2 - (\vec a\cdot\vec b)^2} = \dfrac12|a_1 b_2 - a_2 b_1|$.

## Position vectors
Point $P$ dividing $AB$ in $m:n$: $\vec p = \dfrac{n\vec a + m\vec b}{m+n}$. Midpoint $\dfrac{\vec a + \vec b}2$. Centroid $\dfrac{\vec a + \vec b + \vec c}3$.
$P$ on line $AB$ ⟺ $\vec p = (1-t)\vec a + t\vec b$ (coefficients sum to 1).

## Finding a point in a triangle (the standard EJU problem)
Express $\overrightarrow{AP}$ two ways (along two lines through $P$) using parameters $s, t$; since $\vec b, \vec c$ are not parallel, compare coefficients to solve for $s, t$.

> Two non-parallel vectors are a coordinate system: every vector in the plane is $s\vec b + t\vec c$ in exactly one way.`,
      ja: r`## 成分
$\vec a = (a_1, a_2)$：$|\vec a| = \sqrt{a_1^2 + a_2^2}$、$\vec a + \vec b = (a_1 + b_1, a_2 + b_2)$、$k\vec a = (ka_1, ka_2)$。
$\overrightarrow{AB} = \overrightarrow{OB} - \overrightarrow{OA}$ ＝（終点）−（始点）。
平行：$\vec b = k\vec a$ ⟺ $a_1 b_2 - a_2 b_1 = 0$。

## 内積
$$\vec a\cdot\vec b = |\vec a||\vec b|\cos\theta = a_1 b_1 + a_2 b_2$$
- $\vec a \perp \vec b \iff \vec a\cdot\vec b = 0$。
- $|\vec a|^2 = \vec a\cdot\vec a$、よって $|\vec a + \vec b|^2 = |\vec a|^2 + 2\vec a\cdot\vec b + |\vec b|^2$（普通の展開と同じ）。
- なす角：$\cos\theta = \dfrac{\vec a\cdot\vec b}{|\vec a||\vec b|}$。
- 三角形の面積：$S = \dfrac12\sqrt{|\vec a|^2|\vec b|^2 - (\vec a\cdot\vec b)^2} = \dfrac12|a_1 b_2 - a_2 b_1|$。

## 位置ベクトル
$AB$ を $m:n$ に内分する点 $P$：$\vec p = \dfrac{n\vec a + m\vec b}{m+n}$。中点 $\dfrac{\vec a + \vec b}2$。重心 $\dfrac{\vec a + \vec b + \vec c}3$。
$P$ が直線 $AB$ 上 ⟺ $\vec p = (1-t)\vec a + t\vec b$（係数の和が1）。

## 三角形の中の点を求める（EJUの定番）
$P$ を通る2本の直線に沿って $\overrightarrow{AP}$ を $s, t$ で2通りに表す。$\vec b, \vec c$ が平行でないので係数比較で $s, t$ が決まる。

> 平行でない2つのベクトルは座標系：平面のどのベクトルも $s\vec b + t\vec c$ とただ1通りに書ける。`,
    },
    exam: {
      en: ['$\\overrightarrow{AP}$ as $s\\overrightarrow{AB} + t\\overrightarrow{AC}$ where two cevians meet; then an area ratio.', 'Given $|\\vec a|$, $|\\vec b|$ and the angle, find $|\\vec a - 2\\vec b|$ or the $t$ making $\\vec a + t\\vec b \\perp \\vec a$.', 'Angle between vectors from components.'],
      ja: ['2本の線分の交点 $P$ について $\\overrightarrow{AP} = s\\overrightarrow{AB} + t\\overrightarrow{AC}$、続いて面積比。', '$|\\vec a|$、$|\\vec b|$、なす角から $|\\vec a - 2\\vec b|$、または $\\vec a + t\\vec b \\perp \\vec a$ となる $t$。', '成分からなす角。'],
    },
    traps: {
      en: ['$|\\vec a - \\vec b| \\ne |\\vec a| - |\\vec b|$: square it and expand.', 'Internal division: $m:n$ puts $n$ with $\\vec a$ (the start).', 'The dot product is a number, not a vector.'],
      ja: ['$|\\vec a - \\vec b| \\ne |\\vec a| - |\\vec b|$。2乗して展開する。', '内分 $m:n$ では $\\vec a$（始点側）に $n$ がつく。', '内積は数であってベクトルではない。'],
    },
    followups: {
      en: ['Why does $\\vec a\\cdot\\vec b = 0$ mean perpendicular?', 'Walk through the two-expressions method for a point inside a triangle.', 'Quiz me on dot-product calculations.'],
      ja: ['$\\vec a\\cdot\\vec b = 0$ が垂直を意味する理由は？', '三角形内部の点を2通りの表し方で求める方法を一緒に。', '内積計算のミニテストを出して。'],
    },
  },
  {
    id: 'vectors-space',
    core: {
      en: 'Space vectors are plane vectors with a third component; every formula just grows one term. New objects: a plane (needs three non-collinear points) and a sphere (centre + radius, like a circle).',
      ja: '空間ベクトルは成分が1つ増えただけ。公式は全部「項が1つ増える」。新しく出るのは平面（同一直線上にない3点で決まる）と球（円と同じく中心＋半径）。',
    },
    body: {
      en: r`## Same formulas, three components
$|\vec a| = \sqrt{a_1^2 + a_2^2 + a_3^2}$, $\vec a\cdot\vec b = a_1b_1 + a_2b_2 + a_3b_3$, $\cos\theta = \dfrac{\vec a\cdot\vec b}{|\vec a||\vec b|}$.
Perpendicular ⟺ dot product 0. Parallel ⟺ one is a multiple of the other.

## Points on lines and planes
- $P$ on line $AB$: $\vec p = \vec a + t\overrightarrow{AB}$.
- $P$ on plane $ABC$: $\vec p = \vec a + s\overrightarrow{AB} + t\overrightarrow{AC}$, equivalently $\vec p = \alpha\vec a + \beta\vec b + \gamma\vec c$ with $\alpha + \beta + \gamma = 1$.
- Foot of the perpendicular $H$ from $P$ to plane $ABC$: write $\vec h$ with parameters, then $\overrightarrow{PH}\cdot\overrightarrow{AB} = 0$ and $\overrightarrow{PH}\cdot\overrightarrow{AC} = 0$. Two equations, two unknowns.

## Sphere
$(x-a)^2 + (y-b)^2 + (z-c)^2 = r^2$. Cut by the plane $z = k$: a circle of radius $\sqrt{r^2 - (k-c)^2}$.

## Tetrahedron volume
$V = \dfrac13 \times (\text{base area}) \times (\text{height})$; the height is $|\overrightarrow{PH}|$ from the foot-of-perpendicular calculation.
Base area from vectors: $S = \dfrac12\sqrt{|\vec a|^2|\vec b|^2 - (\vec a\cdot\vec b)^2}$.

> Space problems are two "perpendicular to the plane" equations plus one length. Set them up mechanically.`,
      ja: r`## 同じ公式、成分が3つ
$|\vec a| = \sqrt{a_1^2 + a_2^2 + a_3^2}$、$\vec a\cdot\vec b = a_1b_1 + a_2b_2 + a_3b_3$、$\cos\theta = \dfrac{\vec a\cdot\vec b}{|\vec a||\vec b|}$。
垂直 ⟺ 内積0。平行 ⟺ 一方が他方の実数倍。

## 直線上・平面上の点
- 直線 $AB$ 上の $P$：$\vec p = \vec a + t\overrightarrow{AB}$。
- 平面 $ABC$ 上の $P$：$\vec p = \vec a + s\overrightarrow{AB} + t\overrightarrow{AC}$、同じことだが $\vec p = \alpha\vec a + \beta\vec b + \gamma\vec c$、$\alpha + \beta + \gamma = 1$。
- $P$ から平面 $ABC$ に下ろした垂線の足 $H$：$\vec h$ を媒介変数で書き、$\overrightarrow{PH}\cdot\overrightarrow{AB} = 0$、$\overrightarrow{PH}\cdot\overrightarrow{AC} = 0$。式2つで未知数2つ。

## 球
$(x-a)^2 + (y-b)^2 + (z-c)^2 = r^2$。平面 $z = k$ で切ると半径 $\sqrt{r^2 - (k-c)^2}$ の円。

## 四面体の体積
$V = \dfrac13 \times (\text{底面積}) \times (\text{高さ})$。高さは垂線の足の計算から $|\overrightarrow{PH}|$。
底面積：$S = \dfrac12\sqrt{|\vec a|^2|\vec b|^2 - (\vec a\cdot\vec b)^2}$。

> 空間の問題は「平面に垂直」の式2本と長さ1つ。機械的に立てる。`,
    },
    exam: {
      en: ['Foot of the perpendicular from a point to a plane, then the distance and a tetrahedron volume.', 'Point on a line closest to a given point ($\\overrightarrow{PH} \\perp$ direction).', 'Angle between two edges of a cube or a regular tetrahedron via dot products.'],
      ja: ['点から平面への垂線の足、続いて距離と四面体の体積。', '直線上で与えられた点に最も近い点（$\\overrightarrow{PH} \\perp$ 方向ベクトル）。', '立方体・正四面体の2辺のなす角を内積で。'],
    },
    traps: {
      en: ['A plane needs two perpendicularity conditions, not one.', 'Coefficients summing to 1 is the test for "in the plane ABC" only when written as $\\alpha\\vec a + \\beta\\vec b + \\gamma\\vec c$.', 'Do not forget the $\\frac13$ in the pyramid volume.'],
      ja: ['平面には垂直条件が2つ必要。1つでは足りない。', '「平面 $ABC$ 上」を係数の和＝1で判定できるのは $\\alpha\\vec a + \\beta\\vec b + \\gamma\\vec c$ の形のとき。', '錐体の体積の $\\frac13$ を忘れない。'],
    },
    followups: {
      en: ['Why do two dot-product conditions fix the foot of the perpendicular?', 'Do a regular tetrahedron angle problem with me.', 'Quiz me on space vector components.'],
      ja: ['内積の条件2つで垂線の足が決まる理由は？', '正四面体のなす角の問題を一緒に。', '空間ベクトルの成分計算のミニテストを出して。'],
    },
  },
];

const notes: SubjectNotes = {
  subject: 'math',
  tree: TREES.math,
  notes: Object.fromEntries(N.map((n) => [n.id, n])),
};
export default notes;
