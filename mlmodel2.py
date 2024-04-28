import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from collections import Counter
import PyPDF2
import os
import sys
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer
# from transformers import pipeline, PegasusForConditionalGeneration, PegasusTokenizer
# from sentence_transformers import SentenceTransformer

# def abstractive_summarization(text):
#     model_name = "google/pegasus-xsum"
#     tokenizer = PegasusTokenizer.from_pretrained(model_name)
#     model = PegasusForConditionalGeneration.from_pretrained(model_name)
#     summarizer = pipeline("summarization", model=model, tokenizer=tokenizer)
#     summary = summarizer(text, max_length=200, min_length=int(0.05*len(text)), do_sample=False)[0]['summary_text']
#     return summary

def pdf_to_text(pdf_path):
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        text = ''
        for page_num in range(len(reader.pages)):
            text += reader.pages[page_num].extract_text()
        return text


def summarize_with_dictionary(text, important_words_file, target_word_count):
    nltk.download('stopwords')
    nltk.download('punkt')
    sentences = sent_tokenize(text)

    important_words = set()
    with open(important_words_file, 'r') as f:
        for line in f:
            important_words.add(line.strip().lower()) 

    word_freq = Counter(word.lower() for sentence in sentences for word in word_tokenize(sentence))

    idf_scores = {}
    for word in important_words:
        if word in word_freq:
            idf_scores[word] = len(sentences) / word_freq[word] 

    sentence_scores = {i: 0 for i in range(len(sentences))}
    for i, sentence in enumerate(sentences):
        for word in word_tokenize(sentence.lower()):
            if word in idf_scores:
                sentence_scores[i] += idf_scores[word]

    sorted_sentences = sorted(sentence_scores.items(), key=lambda x: x[1], reverse=True)

    current_word_count = 0
    summary_sentences = []
    for index, score in sorted_sentences:
        sentence = sentences[index]
        num_words = len(word_tokenize(sentence))
        if current_word_count + num_words <= target_word_count:
            summary_sentences.append(sentence)
            current_word_count += num_words
        else:
            break  

    summary = ' '.join(summary_sentences)

    return summary


def sumy_summarize(pdf_text, num_words):
    parser = PlaintextParser.from_string(pdf_text, Tokenizer("english"))
    summarizer = LexRankSummarizer()

    avg_words_per_sentence = len(pdf_text.split()) / len(parser.document.sentences)
    num_sentences = int(num_words / avg_words_per_sentence)
    
    summary_sentences = summarizer(parser.document, num_sentences)
    summary = ' '.join([str(sentence) for sentence in summary_sentences])
    return summary

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python mlmodel2.py <pdf_filename> <important_words_file> <target_word_count>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    important_words_file = sys.argv[2]
    target_word_count = int(sys.argv[3])

    # Convert PDF to text
    pdf_text = pdf_to_text(pdf_path)
    # Summarize the text
    summary_suzy = sumy_summarize(pdf_text, target_word_count)
    print("Summary:\n", summary_suzy, flush=True)
    summary_temp = summarize_with_dictionary(pdf_text, important_words_file, target_word_count)
    print("Summary temp:\n", summary_temp, flush=True)
    #summary_tra = abstractive_summarization(pdf_text)
    #print("Summary transformer:\n", summary_tra, flush=True)

