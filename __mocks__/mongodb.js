// Minimal stub of mongodb/bson internals for Jest tests
// Expose the properties Mongoose may touch during require-time

function ObjectId(id) {
  if (!(this instanceof ObjectId)) return new ObjectId(id)
  this.id = id || 'mocked-object-id'
}
ObjectId.prototype.toString = function() { return String(this.id) }

const NumberUtils = {
  // provide small helpers used internally; keep behavior simple
  toPositive: (v) => {
    const n = Number(v)
    if (Number.isNaN(n)) return 0
    return Math.abs(n)
  }
}

const Long = {
  fromNumber: (n) => Number(n)
}

const Binary = function() {}
const Decimal128 = {
  fromString: (s) => String(s)
}

module.exports = {
  ObjectId,
  BSON: {},
  NumberUtils,
  Long,
  Binary,
  Decimal128,
}
