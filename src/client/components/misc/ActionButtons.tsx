import styled from '@emotion/styled';
import Button from 'client/components/Form/Button';
import colors from 'client/styles/colors';

const ActionButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 0.45rem;
  align-items: center;
  flex-shrink: 0;
  max-width: 100%;
  @media (max-width: 640px) {
    width: 100%;
    justify-content: flex-start;
  }
`;

interface Action {
  label: string;
  shortLabel?: string;
  icon?: string;
  onClick: () => void;
}

const actionButtonStyles = `
  min-width: 0;
  width: auto;
  padding: 0.5rem 0.8rem;
  font-size: 0.83rem;
  line-height: 1;
  text-align: center;
  color: ${colors.textColor};
  background: ${colors.surfaceAccent};
  box-shadow: none;
  border-radius: 999px;
  border: 1px solid ${colors.borderSubtle};
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  &:hover {
    color: ${colors.primary};
    background: color-mix(in srgb, ${colors.surfaceAccent} 70%, ${colors.primaryTransparent});
    border-color: ${colors.borderStrong};
    box-shadow: none;
  }
`;

const ActionButtons = (props: { actions: Action[] | undefined }): JSX.Element => {
  const actions = props.actions;
  if (!actions?.length) return <></>;
  return (
    <ActionButtonContainer>
      {actions.map((action, index) => (
        <Button
          key={`action-${index}`}
          styles={actionButtonStyles}
          onClick={action.onClick}
          title={action.label}
        >
          {action.icon && <span aria-hidden="true">{action.icon}</span>}
          <span>{action.shortLabel || action.label}</span>
        </Button>
      ))}
    </ActionButtonContainer>
  );
};

export default ActionButtons;
