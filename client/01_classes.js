class Player {
	constructor({x=0, y=0, z=0, w=0, h=63, k=63, t=23}){
		this.x = x; // 10 bits _range: 0-1023
		this.y = y; // 10 bits _range: 0-1023
		this.z = z; // 8 bits _range: 0-255
		this.w = w;				// 6 bits _range: 0-63
		this.health = h;		// 6 bits _range: 0-63
		this.tank = k;			// 6 bits _range: 0-63
		this.temperature = t;	// 6 bits _range: 0-63
	}
}
class Inputs {
	constructor({w=false, s=false, a=false, d=false, q=false, o=false,
		j=false, k=false, l=false, u=false, i=false, e=false}){
		this.w = w; // 1 bits _bool
		this.s = s; // 1 bits _bool
		this.a = a; // 1 bits _bool
		this.d = d; // 1 bits _bool
		this.q = q; // 1 bits _bool
		this.o = o; // 1 bits _bool
		this.j = j; // 1 bits _bool
		this.k = k; // 1 bits _bool
		this.l = l; // 1 bits _bool
		this.u = u; // 1 bits _bool
		this.i = i; // 1 bits _bool
		this.e = e; // 1 bits _bool
	}
}


class BitWriter {
	constructor(sizeBytes) {
		this.buffer = new Uint8Array(sizeBytes);
		this.byte = 0;
		this.bit = 0;
	}

	write(value, bits) {
		// Mask value so it cannot overflow the bit count
		value &= (1 << bits) - 1;

		for (let i = bits - 1; i >= 0; i--) {
			const bit = (value >> i) & 1;

			if (this.byte >= this.buffer.length) {
				throw new Error("BitWriter overflow");
			}

			this.buffer[this.byte] |= bit << (7 - this.bit);
			this.bit++;

			if (this.bit === 8) {
				this.bit = 0;
				this.byte++;
			}
		}
	}

	getBuffer() {
		return this.buffer;
	}
}

class BitReader {
	constructor(buffer) {
		this.buffer = buffer;
		this.byte = 0;
		this.bit = 0;
	}

	read(bits) {
		let value = 0;

		for (let i = 0; i < bits; i++) {
			if (this.byte >= this.buffer.length) {
				throw new Error("BitReader overflow");
			}

			value <<= 1;
			const bit = (this.buffer[this.byte] >> (7 - this.bit)) & 1;
			value |= bit;

			this.bit++;
			if (this.bit === 8) {
				this.bit = 0;
				this.byte++;
			}
		}

		return value;
	}
}

