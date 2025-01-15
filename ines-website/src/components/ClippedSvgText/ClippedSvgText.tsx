import React from "react";

const getClippedText = (longText: string, maxLength: number): string => {
  let clippedText = longText.slice(0, maxLength);

  if (clippedText !== longText) {
      clippedText = clippedText.concat('...')
  }

  return clippedText
}

interface ClippedSvgTextProps extends React.SVGProps<SVGElement> {
  text: string;
  maxLength: number; // Maximum number of characters
  elementType?: 'text' | 'tspan'; // Element type for the text
  className?: string;
  fontSize?: number; // Font size for the text
}

const ClippedSvgText: React.FC<ClippedSvgTextProps> = ({
  elementType = 'tspan',
  text: longText,
  maxLength,
  ...other
}) => {
  const clippedText = getClippedText(longText, maxLength);

  const content = <>
    {clippedText}
    <title>{longText}</title>
  </>

  if (elementType === 'text') {
    return (
      <text {...(other as React.SVGProps<SVGTextElement>)}>
        {content}
      </text>
    );
  }

  return (
    <tspan {...(other as React.SVGProps<SVGTSpanElement>)}>
      {content}
    </tspan>
  );
};

export default ClippedSvgText
