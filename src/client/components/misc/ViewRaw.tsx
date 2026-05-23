import { useState } from 'react';
import styled from '@emotion/styled';
import colors from 'client/styles/colors';
import { Card } from 'client/components/Form/Card';
import Button from 'client/components/Form/Button';

const CardStyles = `
margin: 0 auto;
width: 100%;
max-width: 100%;
position: relative;
transition: all 0.2s ease-in-out;
display: flex;
flex-direction: column;
gap: 0.85rem;
a {
  color: ${colors.primary};
}
.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  button {
    width: auto;
    min-width: 11rem;
    max-width: 100%;
  }
}
small {
  margin-top: 0.15rem;
  font-size: 0.82rem;
  line-height: 1.5;
  opacity: 0.72;
}
`;

const StyledIframe = styled.iframe`
  width: 100%;
  outline: none;
  border: none;
  border-radius: 12px;
  min-height: 50vh;
  height: 100%;
  margin: 0;
  background: ${colors.background};
`;

const ViewRaw = (props: { everything: { id: string; result: any }[] }) => {
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const makeResults = () => {
    const result: { [key: string]: any } = {};
    props.everything.forEach((item: { id: string; result: any }) => {
      result[item.id] = item.result;
    });
    return result;
  };

  const fetchResultsUrl = async () => {
    const resultContent = makeResults();
    const response = await fetch('https://jsonhero.io/api/create.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'web-check results',
        content: resultContent,
        readOnly: true,
        ttl: 3600,
      }),
    });
    if (!response.ok) {
      setError(`HTTP error! status: ${response.status}`);
    } else {
      setError(null);
    }
    await response.json().then((data) => setResultUrl(data.location));
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(makeResults(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'web-check-results.json';
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <Card heading="View / Download Raw Data" styles={CardStyles}>
      <div className="controls">
        <Button onClick={handleDownload}>Download Results</Button>
        <Button onClick={fetchResultsUrl}>{resultUrl ? 'Update Results' : 'View Results'}</Button>
        {resultUrl && <Button onClick={() => setResultUrl('')}>Hide Results</Button>}
      </div>
      {resultUrl && !error && (
        <>
          <StyledIframe title="Results, via JSON Hero" src={resultUrl} />
          <small>
            Your results are available to view <a href={resultUrl}>here</a>.
          </small>
        </>
      )}
      {error && <p className="error">{error}</p>}
      <small>
        These are the raw results generated from your URL, and in JSON format. You can import these
        into your own program, for further analysis.
      </small>
    </Card>
  );
};

export default ViewRaw;
