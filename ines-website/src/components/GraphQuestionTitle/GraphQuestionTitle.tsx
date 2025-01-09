import React, { useEffect, useState } from "react";

interface GraphQuestionTitleProps {
  text: string;
  maxLength: number; // Maximum number of characters
  className?: string;
  fontSize?: number; // Font size for the text
}

const GraphQuestionTitle: React.FC<GraphQuestionTitleProps> = ({
  text: longText,
  maxLength,
  ...other
}) => {
  const [shortText, setShortText] = useState(longText)

  useEffect(() => {
    const originalText = longText || '';
    let truncatedText = longText.slice(0, maxLength);

    if (truncatedText !== originalText) {
        truncatedText = truncatedText.concat('...')
    }

    setShortText(truncatedText)
  }, [longText, maxLength]);

  return (
    <tspan {...other}>
        {shortText}
        <title>{longText}</title>
    </tspan>
  );
};

export default GraphQuestionTitle
