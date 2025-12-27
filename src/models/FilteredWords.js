import mongoose from 'mongoose';

const FilteredWordsSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Creator',
    required: true,
    unique: true,
    index: true
  },
  words: {
    type: [String],
    default: [],
    validate: {
      validator: function(words) {
        return words.length <= 100; // Max 100 kata
      },
      message: 'Maksimal 100 kata yang dapat difilter'
    }
  }
}, {
  timestamps: true
});

// Index untuk query cepat
FilteredWordsSchema.index({ creatorId: 1 });

// Method untuk add word
FilteredWordsSchema.methods.addWord = function(word) {
  const cleanWord = word.trim().toLowerCase();
  if (cleanWord && !this.words.includes(cleanWord) && this.words.length < 100) {
    this.words.push(cleanWord);
    return true;
  }
  return false;
};

// Method untuk remove word
FilteredWordsSchema.methods.removeWord = function(word) {
  const cleanWord = word.trim().toLowerCase();
  const index = this.words.indexOf(cleanWord);
  if (index > -1) {
    this.words.splice(index, 1);
    return true;
  }
  return false;
};

// Static method untuk get atau create
FilteredWordsSchema.statics.getOrCreate = async function(creatorId) {
  let filteredWords = await this.findOne({ creatorId });
  
  if (!filteredWords) {
    filteredWords = await this.create({ creatorId, words: [] });
  }
  
  return filteredWords;
};

export default mongoose.models.FilteredWords || mongoose.model('FilteredWords', FilteredWordsSchema);
