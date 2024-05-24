import nltk
from nltk.tokenize import sent_tokenize, word_tokenize
from collections import Counter
import PyPDF2
import os
import sys
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lex_rank import LexRankSummarizer



def pdf_to_text(pdf_path):
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
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


def sumy_summarize(pdf_text, num_words):
    parser = PlaintextParser.from_string(pdf_text, Tokenizer("english"))
    summarizer = LexRankSummarizer()

    avg_words_per_sentence = len(pdf_text.split()) / len(parser.document.sentences)
    num_sentences = int(num_words / avg_words_per_sentence)
    
    summary_sentences = summarizer(parser.document, num_sentences)
    summary = ' '.join([str(sentence) for sentence in summary_sentences])
    return summary

def write_summary_to_file(summary, pdf_filename):
    # Extract the file name without extension
    pdf_name_without_ext = pdf_filename;
    # Generate the text file name with .txt extension
    txt_filename = f"{pdf_name_without_ext}.txt"
    txtpath = txt_filename
    # Write the summary to the text file
    with open(txtpath, 'w') as txt_file:
        txt_file.write(summary)

if __name__ == "__main__":
    if len(sys.argv) != 4:
        print("Usage: python mlmodel2.py <pdf_filename> <important_words_file> <target_word_count>")
        sys.exit(1)

    pdf_path = sys.argv[1]
    important_words_file = sys.argv[2]
    target_word_count = int(sys.argv[3])

    # Convert PDF to text
    pdf_text = pdf_to_text(pdf_path)

# Extract the file name without the extension
    file_name_without_ext = os.path.splitext(os.path.basename(pdf_path))[0]
    # Summarize the text
    summary_suzy = sumy_summarize(pdf_text, target_word_count)
    print("Summary:\n", summary_suzy, flush=True)

    write_summary_to_file(summary_suzy, file_name_without_ext)
    #print("\n\n\n\n")
    #summary_temp = summarize_with_dictionary(pdf_text, important_words_file, target_word_count)
    #print("Summary temp:\n", summary_temp, flush=True)


