import { Box, Button, For, Group, List, Skeleton, Stack, Text } from "@chakra-ui/react";
import axios from 'axios';
import { jsPDF } from "jspdf";
import { marked } from "marked";
import { useEffect, useRef, useState } from 'react';
import SignatureCanvas from "react-signature-canvas";
import { useAuth } from "../provider/authProvider";
import { BASE_URL } from '../router/apiClient';
import { StudyData } from '../types/StudyTypes';
import ChakraMarkdown from "./ChakraMarkdown";
import {
  AccordionItem,
  AccordionItemContent,
  AccordionItemTrigger,
  AccordionRoot,
} from "./ui/accordion";
import { DataListItem, DataListRoot } from "./ui/data-list";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
/** Margin used in generating PDF from Markdown string */
const MARGIN = 20;

/**
 * 
 * @param props.study Object containing all information about the study
 * @param props.joinedStudy Method called once a study has successfully been joined
 * @returns Element containing list of data about study, including option to sign informed consent form and join study
 */
export const JoinStudyInfo = (props: { study: StudyData, joinedStudy: (name: string) => void }) => {
  const { study, joinedStudy } = props;

  // pdfURL is null while the PDF is still loading in `generatePDF`
  const [pdfURL, setPdfURL] = useState<string | null>(null);
  const sigPadRef = useRef<SignatureCanvas | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const generatePDF = async () => {
      // Wait for marked to resolve
      const htmlContent = await marked(study.informedConsent, { breaks: true });

      // Create a jsPDF instance
      const pdf = new jsPDF({
          orientation: 'p',
          unit: 'pt',
          format: 'letter'
      });

      // Use the html method to add HTML content to the PDF
      pdf.html(htmlContent, {
        callback: (pdf) => {
          const pdfBlob = pdf.output("blob");
          const generatedPDFURL = URL.createObjectURL(pdfBlob);
          setPdfURL(generatedPDFURL);
        },
        margin: [MARGIN, MARGIN, MARGIN, MARGIN], // Set appropriate margins
        autoPaging: 'text', // Crucial for handling text flow across pages
        width: pdf.internal.pageSize.getWidth() - MARGIN*2,
        windowWidth: pdf.internal.pageSize.getWidth() - MARGIN*2,
        // html2canvas: {
        //     width: pdf.internal.pageSize.getWidth() - MARGIN*2,
        //     height: pdf.internal.pageSize.getHeight() - MARGIN*2,
        //     useCORS: true,  // Enable CORS for styles and images
        // }, 
      });
    };

    // Call the generatePDF function when study changes
    generatePDF();
  }, [study]);

  // TODO this is here in case we would like to create a button to download the PDF instead of displaying in-browser.
  // const downloadInformedConsent = () => {
  //   if (pdfURL) {
  //     const link = document.createElement("a");
  //     link.href = pdfURL;
  //     link.download = "Informed_Consent_Form.pdf";
  //     link.click();
  //   }
  // };

  // Function to clear the signature
  const clearSignature = () => {
    sigPadRef.current?.clear();
    setIsSigned(false);
  };

  const joinStudy = async () => {
    // get signature image as base64 PNG
    const sigDataUrl = sigPadRef.current?.toDataURL('image/png');

    if (sigDataUrl && pdfURL) {
      // // Create a jsPDF Informed Consent form
      // Wait for marked to resolve
      const htmlContent = await marked(study.informedConsent);

      // Create a jsPDF instance
      const pdf = new jsPDF({
          orientation: 'p',
          unit: 'pt',
          format: 'letter'
      });

      // Use the html method to add HTML content to the PDF
      pdf.html(htmlContent, {
        callback: (pdf) => saveSigPDF(pdf, sigDataUrl),
        margin: [MARGIN, MARGIN, MARGIN, MARGIN], // Set appropriate margins
        autoPaging: 'text', // Crucial for handling text flow across pages
        width: pdf.internal.pageSize.getWidth() - MARGIN*2,
        windowWidth: pdf.internal.pageSize.getWidth() - MARGIN*2,
        // html2canvas: {
        //     width: pdf.internal.pageSize.getWidth() - MARGIN*2,
        //     height: pdf.internal.pageSize.getHeight() - MARGIN*2,
        //     useCORS: true,  // Enable CORS for styles and images
        // }, 
      });
    } else {
      alert("An error occurred while trying to join study.");
    }
  };

  const saveSigPDF = (pdf: jsPDF, sigDataUrl: string) => {
    // Position the signature at the bottom of the page

    // Add the signature image (base64 PNG format)
    pdf.addPage();
    pdf.text("Participant's signature:", MARGIN, MARGIN);
    pdf.addImage(sigDataUrl, 'PNG', MARGIN, MARGIN + 30, 200, 100);  // Adjust width, height, and position
    const formattedDate = (new Date()).toISOString().split("T")[0]; // Example: "2024-12-18". Note this is in UTC timezone.
    pdf.text(`Date: ${formattedDate}`, MARGIN, MARGIN + 30 + 100 + 30);

    // Convert PDF to base64 string
    const base64PDF = pdf.output('datauristring');

    // TODO upload to backend
    axios.post(BASE_URL + `/user/studies/${study.id}`, {
        signed_informed_consent: base64PDF,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      } )
      .then(_ => {
        // Automatically saves file for user
      pdf.save("informed_consent.pdf");

      // Callback function to parent component
      joinedStudy(study.name);
      })
      .catch(err => {
        alert(`There was an issue joining the study: ${err.response.data.error}`);
        console.error(err);
      })
  }

  return (
    <Stack>
      <DataListRoot size="lg" gap="1.5em">
        <DataListItem label="Name" value={study.name} />
        <DataListItem
          label="Registration End"
          value={study.endDate.toLocaleString()}
        />
        <DataListItem
          label="Study Duration"
          value={study.duration.toHuman()}
        />
        <DataListItem
          label="Description"
          value={study.description}
        />
        <DataListItem
          label="Recorded Metrics"
          value={
            <List.Root>
              <For each={(study.metrics)}>
                {(metric, idx) => (
                  <List.Item key={idx}>{metric.name}</List.Item>
                )}
              </For>
            </List.Root>
          }
        />
        <DataListItem
          label="Inclusion Criteria"
          value={
            <Box p="1em" w="100%" border="1px solid lightgray" borderRadius="md">
              <ChakraMarkdown md={study.inclusionCriteria} />
            </Box>
          }
        />
        <DataListItem
          label="Informed Consent Form"
          value={
            <Stack w="100%">
              <Text>If the PDF below does not load correctly, please expand the toggle button.</Text>
              <AccordionRoot w="auto" m="0.5em" variant="enclosed" collapsible={true}>
                <AccordionItem value="informed-consent">
                  <AccordionItemTrigger>Toggle Informed Consent Markdown</AccordionItemTrigger>
                  <AccordionItemContent>
                    <ChakraMarkdown md={study.informedConsent} />
                  </AccordionItemContent>
                </AccordionItem>
              </AccordionRoot>
            </Stack>
          }
        />
      </DataListRoot>
      {pdfURL ? (
        <div>
          <iframe
            src={pdfURL}
            title="Informed Consent Form"
            style={{
              width: "100%",
              height: "500px",
              border: "1px solid lightgray",
            }}
          ></iframe>
          <Text my="1em">Once you have read all information, please indicate your agreement by signing in the box below.</Text>
          <SignatureCanvas
            ref={sigPadRef}
            penColor="black"
            canvasProps={{ width: 500, height: 200, className: 'signature-canvas' }}
            onEnd={() => setIsSigned(true)}
            backgroundColor="#eee"
          />
          <Group mt="1em">
            <Button variant="surface" onClick={clearSignature}>Clear Signature</Button>
            <DialogRoot placement="center" size="lg">
              <DialogTrigger asChild>
                <Button disabled={!isSigned}>Join Study</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogCloseTrigger />
                <DialogHeader>
                  <DialogTitle>Are you sure you want to join the study?</DialogTitle>
                </DialogHeader>
                <DialogBody>
                  <p>
                    As soon as you join, your data will be available to the study organizer.
                  </p>
                  <p>
                    You can leave the study at any point, at which point your data will no longer be sent.
                  </p>
                  <br />
                  <p>
                    Note that confirming your participation will automatically download your signed Informed Consent form.
                  </p>
                </DialogBody>
                <DialogFooter>
                  <DialogActionTrigger asChild>
                    <Button variant="surface">Cancel</Button>
                  </DialogActionTrigger>
                  <DialogActionTrigger asChild>
                    <Button variant="solid" onClick={joinStudy}>Join Study</Button>
                  </DialogActionTrigger>
                </DialogFooter>
              </DialogContent>
            </DialogRoot>
          </Group>
        </div>
      ) : <Skeleton aria-label="Loading PDF" /> }
    </Stack>
  );
}

export default JoinStudyInfo;