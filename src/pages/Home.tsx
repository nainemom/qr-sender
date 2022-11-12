import { Link } from 'preact-router/match';
import { RouterProps } from 'preact-router';

export default function Home(_props: RouterProps) {
  return (
    <div>
      <Link href="/send">
        Send
      </Link>
      |
      <Link href="/receive">
        Receive
      </Link>
    </div>
  );
}