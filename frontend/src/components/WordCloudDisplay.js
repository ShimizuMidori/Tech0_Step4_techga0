import React from 'react';

const WordCloudDisplay = () => {
    const wordCloudUrl = 'http://127.0.0.1:8000/static/images/wordcloud.png'; // URLを修正

    return (
        <div>
            {wordCloudUrl ? (
                <img src={wordCloudUrl} alt="Word Cloud" />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default WordCloudDisplay;
