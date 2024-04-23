import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from collections import Counter
import PyPDF2
import os
import sys

def pdf_to_text(pdf_path):
    # Open the PDF file
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        # Extract text from each page
        text = ''
        for page_num in range(len(reader.pages)):
            text += reader.pages[page_num].extract_text()
        return text


def summarize_with_dictionary(text, important_words_file, target_word_count):
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

# For testing purposes
if __name__ == "__main__":
    # Check if correct number of arguments are provided
    if len(sys.argv) != 4:
        print("Usage: python mlmodel2.py <pdf_filename> <important_words_file> <target_word_count>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    important_words_file = sys.argv[2]
    target_word_count = int(sys.argv[3])

    # Convert PDF to text
    pdf_text = pdf_to_text(pdf_path)
    # Summarize the text
    summary = summarize_with_dictionary(pdf_text, important_words_file, target_word_count)
    print("Summary:\n", summary, flush=True)
