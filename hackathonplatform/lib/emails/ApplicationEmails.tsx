import {
  Body,
  Container,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

const styles = {
  body: { backgroundColor: "#f4f4f5", fontFamily: "Arial, sans-serif", padding: "24px 0" },
  container: { backgroundColor: "#ffffff", margin: "0 auto", maxWidth: "560px", padding: "40px" },
  heading: { color: "#18181b", fontSize: "28px", margin: "0 0 16px" },
  text: { color: "#3f3f46", fontSize: "16px", lineHeight: "1.6" },
  accent: { color: "#15803d", fontWeight: "700" as const },
};

export function ApplicationReceivedEmail({ name, applicationType }: { name: string; applicationType: string }) {
  return (
    <Html>
      <Preview>We received your {applicationType} application.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>Application received</Heading>
          <Text style={styles.text}>Hi {name},</Text>
          <Text style={styles.text}>
            Thanks for applying as a <span style={styles.accent}>{applicationType}</span>. We received your application and our organizers will review it soon.
          </Text>
          <Hr />
          <Text style={styles.text}>You can sign in to the applicant portal any time to review your submitted answers and application status.</Text>
        </Container>
      </Body>
    </Html>
  );
}

export function ApplicationAcceptedEmail({ name }: { name: string }) {
  return (
    <Html>
      <Preview>Your hackathon application was accepted.</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Heading style={styles.heading}>You&apos;ve been accepted</Heading>
          <Text style={styles.text}>Hi {name},</Text>
          <Text style={styles.text}>
            We&apos;re excited to let you know that your hackathon application has been accepted.
          </Text>
          <Section>
            <Text style={{ ...styles.text, ...styles.accent }}>We&apos;ll share more event details soon.</Text>
          </Section>
          <Hr />
          <Text style={styles.text}>You can sign in to the applicant portal to review your application status.</Text>
        </Container>
      </Body>
    </Html>
  );
}
