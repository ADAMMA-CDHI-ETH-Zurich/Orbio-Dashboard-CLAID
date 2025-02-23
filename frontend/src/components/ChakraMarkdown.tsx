import { Box, Heading, Text, List, Link, Code } from "@chakra-ui/react"
import ReactMarkdown from "react-markdown";

/** 
 * Turn a markdown string `props.md` into an element using Chakra UI's components.
 * For instance, instead of rendering text as `<p>`, ChakraMarkdown will turn it into
 * the Chakra UI `<Text>` element for greater compatibility with Chakra UI.
 * 
 * Limited support for different types of markdown syntaxes.
 */
const ChakraMarkdown = (props: {md: string}): JSX.Element => {
  const { md } = props;

  return (
    <Box>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <Heading as="h1" size="lg">{children}</Heading>,
          h2: ({ children }) => <Heading as="h2" size="md">{children}</Heading>,
          h3: ({ children }) => <Heading as="h3" size="sm">{children}</Heading>,
          h4: ({ children }) => <Heading as="h4" size="sm">{children}</Heading>,
          h5: ({ children }) => <Heading as="h5" size="sm">{children}</Heading>,
          h6: ({ children }) => <Heading as="h6" size="sm">{children}</Heading>,
          p: ({ children }) => <Text as="p">{children}</Text>,
          em: ({ children }) => <Text as="em" fontStyle="italic">{children}</Text>,
          strong: ({ children }) => <Text as="strong" fontWeight="bold">{children}</Text>,
          ol: ({ children }) => <List.Root as="ol">{children}</List.Root>,
          ul: ({ children }) => <List.Root as="ul">{children}</List.Root>,
          li: ({ children }) => <List.Item>{children}</List.Item>,
          a: ({ href, children }) => <Link href={href} colorPalette="blue" variant="underline" target="_blank" rel="noopener noreferrer">{children}</Link>,
          code: ({children}) => <Code>{children}</Code>
        }}
      >
        {md}
      </ReactMarkdown>
    </Box>
  );
};

export default ChakraMarkdown;