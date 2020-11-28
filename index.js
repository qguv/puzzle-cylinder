'use strict';

const default_colors = [
    'pink',
    'red',
    'orange',
    'yellow',
    'lightgreen',
    'green',
    'blue',
    'violet',
];

class PuzzleCylinder {
    constructor(rings, ring_size, {color_fn=null}={}) {
        this.color_fn = color_fn ?? ((ring, i) => default_colors[mod(i, default_colors.length)]);

        this.gap = new Array(2);

        this.rings = new Array(rings);
        for (let i = 0; i < rings; i++) {
            this.rings[i] = new Array(ring_size);
        }

        this.init();
    }

    init() {
        this.gap[0] = 0;
        this.gap[1] = 0;

        const x = this.rings.length;
        const y = this.rings[0].length;
        for (let i = 0; i < x; i++) {
            for (let j = 0; j < y; j++) {
                this.rings[i][j] = (i || j) ? this.color_fn(i, j) : null;
            }
        }
    }

    // move gap to a different ring in the same row
    shift(ring) {
        ring = mod(ring, this.rings.length);

        const [gap_old_ring, gap_row] = this.gap;

        const values = this.rings.map(r => r[gap_row])

        values.splice(gap_old_ring, 1);
        values.splice(ring, 0, null);

        for (const [i, value] of values.entries()) {
            this.rings[i][gap_row] = value;
        }

        this.gap[0] = ring;
    }

    // rotate one of the rings
    rotate(ring, amount) {
        ring = mod(ring, this.rings.length);
        amount = mod(amount, this.rings[0].length);

        const a = this.rings[ring];
        for (let i = 0; i < amount; i++) {
            a.push(a.shift());
        }

        if (this.gap[0] === ring) {
            this.gap[1] = mod(this.gap[1] - amount, a.length);
        }
    }

    blit(canvas, {highlight_ring=null}={}) {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        const tile_width = Math.floor(canvas.width / this.rings[0].length);
        const tile_height = Math.floor(canvas.height / this.rings.length);
        const margin = 4;
        const padding = 4;

        for (const [i, ring] of this.rings.entries()) {
            const i_inv = this.rings.length - i - 1;
            for (const [j, color] of ring.entries()) {
                if (color === null) {
                    continue;
                }

                context.fillStyle = color;
                if (highlight_ring === i) {
                    context.fillRect(j*tile_width + margin, i_inv*tile_height + margin, tile_width - 2*margin, tile_height - 2*margin);
                } else {
                    context.fillRect(j*tile_width + padding + margin, i_inv*tile_height + padding + margin, tile_width - 2*padding - 2*margin, tile_height - 2*padding - 2*margin);
                }
            }
        }
    }

    shuffle() {
        const values = this.rings.flat(1);
        shuf(values);

        const x = this.rings.length;
        const y = this.rings[0].length;
        for (let i = 0; i < x; i++ ) {
            for (let j = 0; j < y; j++) {
                const v = values[j * x + i];
                this.rings[i][j] = v;
                if (v === null) {
                    this.gap = [i, j];
                }
            }
        }
    }
}

function shuf(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        [a[i], a[j]] = [a[j], a[i]];
    }
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

