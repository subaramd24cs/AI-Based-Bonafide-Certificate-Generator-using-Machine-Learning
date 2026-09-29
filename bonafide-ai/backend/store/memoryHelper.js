let store = null;
let useMemory = false;

function setMemoryStore(s) { store = s; useMemory = true; }
function isMemoryMode() { return useMemory; }

function createModel(name, schema) {
  if (useMemory && store) {
    return store.getModel(name);
  }
  return null;
}

module.exports = { setMemoryStore, isMemoryMode, createModel };
