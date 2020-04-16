import { appsLinks } from '@virtus/common/appLinks/appLinks';
import { removeQueryParams } from '@virtus/common/utils/router/removeQueryParams';
import { ILayout } from '@virtus/components/DxDataGrid/templates/Layouts/Layouts';
import { NexusIcon } from '@virtus/components/icons';
import Loading from '@virtus/components/Loading';
import { LoadingIconSizes, LoadingIconType } from '@virtus/components/LoadingIcon/LoadingIcon';
import { PageProps } from '@virtus/components/page/Page/Page';
import { useConfirmationDialog } from '@virtus/components/withConfirmationDialogOnClick/withConfirmationDialogOnClick';
import * as queryString from 'query-string';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { requestAsync } from 'redux-query/advanced';
import { Action, Scenario } from 'src/api/mutations';
import { HypoScenarios } from 'src/api/queries';
import { AuthContext } from 'src/app/App/AuthenticationHandlerGlide';
import { GlideLayoutManagerInspector } from 'src/components/GlideLayoutManagerInspector/GlideLayoutManagerInspector';
import { IHypoScenarios } from 'src/components/HypoScenarioGrid/model/HypoScenarioGrid.model';
import PageWrapper from 'src/components/PageWrapper';
import { ViewsWrapper } from 'src/components/PageWrapper/components/ViewsWrapper/ViewsWrapper';
import { useViews, Views } from 'src/components/PageWrapper/hooks/useViews';
import { ActionResult } from 'src/components/PageWrapper/PageWrapper';
import { ScenarioInspector } from 'src/components/ScenarioInspector';
import { LayoutsProvider } from 'src/contexts/layouts/layouts.context';
import { Scenario as IScenario } from 'src/models/scenario/scenario';
import { useScenarios } from 'src/pages/Hypos/hooks/use-scenarios';
import { RootState } from 'src/reducers/rootReducer';
import { ActionAuthParams } from 'src/utils/action-resolver';
import { HypoScenariosView } from './views/HypoScenarios/HypoScenarios';
import { HypoWithTestResultsView } from './views/HypoWithTestResults/HypoWithTestResults';

const EMPTY_SCENARIO = {
  'Current Test Date': '',
  'Current Result': '',
  'Display Name': '',
  'Elapsed Time': '',
  'Scenario Id': '',
  'Notional Field': '',
  'Scenario Orders': [],
  'Start Time': '',
  _uri: '',
  _date: '',
  uriId: 0,
};

interface ReduxProps {
  readonly actionResult: ActionResult;
  readonly hypoScenarios: IHypoScenarios;
  readonly isLoadingHypoScenarios: boolean;
  readonly isResolvingAnAction: boolean;
}

interface ReduxDispatch {
  getHypoScenariosAction: () => void;
  deleteScenarioAction: (scenarioUri: string) => void;
}

interface HyposProps {
  actionAuth: ActionAuthParams;
}

type Props = HyposProps & ReduxProps & ReduxDispatch;

const Hypos = ({
  actionResult,
  hypoScenarios,
  actionAuth,
  deleteScenarioAction,
  getHypoScenariosAction,
  isLoadingHypoScenarios,
}: Props) => {
  const pageProps: Partial<PageProps> = { pageTitle: 'Hypos', testid: 'page-hypos' };
  const dataGridRef = useRef(null);
  const parameters = queryString.parse(location.search) || { uri: undefined };
  const [inspectorVisible, setInspectorVisible] = useState(false);
  const [showLayoutManager, setShowLayoutManager] = useState(false);
  const [selectedScenarioData, setSelectedScenarioData] = useState<IScenario>(EMPTY_SCENARIO);
  const openInspector = useCallback(() => setInspectorVisible(true), []);
  const closeInspector = useCallback(() => {
    (dataGridRef as any).current.instance.selectRowsByIndexes([], true);
    setInspectorVisible(false);
  }, []);

  const [scenarioToDeleteURI, setScenarioToDeleteURI] = useState<string>('');
  const { scenarios, handleOnRunScenario, handleDeleteScenario } = useScenarios(
    actionResult,
    hypoScenarios,
    actionAuth,
  );

  const selectedUriByUrl = parameters.uri;
  useLayoutEffect(() => {
    getHypoScenariosAction();
  }, []);

  useEffect(() => {
    if (!isLoadingHypoScenarios && selectedUriByUrl) {
      removeQueryParams();
    }
  }, [isLoadingHypoScenarios, selectedUriByUrl]);

  const onSelectScenario = useCallback((data: IScenario) => {
    setSelectedScenarioData(data);
    openInspector();
  }, []);

  const handleOnDeleteScenario = (scenarioUri: string) => {
    setScenarioToDeleteURI(scenarioUri);
    handleOnDeleteScenarioWithConfirmation();
  };

  const onSettingsClick = useCallback(() => {
    setShowLayoutManager(true);
    openInspector();
  }, []);

  const { onClickTab, activeViewKey } = useViews({
    initialActiveViewKey: (parameters.activeView as string) || 'tests',
  });

  const onRefreshTable = () => {
    getHypoScenariosAction();
  };

  const handleOnClickTab = (tab: string) => {
    closeInspector();
    setSelectedScenarioData(EMPTY_SCENARIO);
    onClickTab(tab);
  };

  const onCloseLayoutManagerInspector = () => {
    setShowLayoutManager(false);
    closeInspector();
  };
  const renderInspector = () => {
    if (!inspectorVisible) return null;

    if (showLayoutManager) {
      return (
        <GlideLayoutManagerInspector
          onShare={(rowElement: ILayout) => console.log('On Share', rowElement)}
          closeInspector={onCloseLayoutManagerInspector}
        />
      );
    }

    if (selectedScenarioData && selectedScenarioData._uri) {
      return (
        <ScenarioInspector
          actionAuth={actionAuth}
          scenarioUri={selectedScenarioData._uri}
          onCloseInspector={closeInspector}
          onDeleteScenario={handleOnDeleteScenario}
        />
      );
    }
    return null;
  };

  const {
    DialogComponent: DeleteScenarioConfirmDialog,
    onDispatcherClick: handleOnDeleteScenarioWithConfirmation,
  } = useConfirmationDialog({
    onClick: () => handleDeleteScenario(deleteScenarioAction, scenarioToDeleteURI),
    headerText: 'Are you sure?',
    bodyTextContent: 'Are you sure you want delete this scenario?',
    acceptButton: { text: 'Confirm', dataTestId: 'confirm-delete-scenario-btn' },
  });

  return (
    <LayoutsProvider viewUri="hypo_order_blotter" dataGridRef={dataGridRef}>
      <>
        <DeleteScenarioConfirmDialog />
        <PageWrapper
          showInspector={inspectorVisible}
          closeInspector={closeInspector}
          pageProps={pageProps}
          inspector={inspectorVisible && renderInspector()}
          onClickTab={handleOnClickTab}
          views={{
            scenarios: 'Hypo Scenarios',
            tests: 'Hypo + Test Results',
          }}
          links={[
            {
              text: 'Compliance',
              Icon: NexusIcon,
              link: `${appsLinks.nexus[__ENVIRONMENT__]}/compliance`,
              target: 'nexus',
            },
            {
              text: 'Reports',
              Icon: NexusIcon,
              link: `${appsLinks.nexus[__ENVIRONMENT__]}/reporting`,
              target: 'nexus',
            },
          ]}
          activeViewKey={activeViewKey}
          render={({ notification }) => {
            const HypoViews: Views = {
              scenarios: () => (
                <HypoScenariosView
                  onSettingsClick={onSettingsClick}
                  onSelectScenario={onSelectScenario}
                  selectedUriByUrl={parameters.uri}
                  onDeleteScenario={handleOnDeleteScenario}
                  onRunScenario={handleOnRunScenario}
                  scenarios={scenarios}
                  onRefreshTable={onRefreshTable}
                />
              ),
              tests: () => (
                <HypoWithTestResultsView
                  selectedUriByUrl={parameters.uri}
                  onDeleteScenario={handleOnDeleteScenario}
                  onRunScenario={handleOnRunScenario}
                  scenarios={scenarios}
                  onRefreshTable={onRefreshTable}
                />
              ),
            };
            if (isLoadingHypoScenarios || !scenarios) {
              return (
                <Loading
                  type={LoadingIconType.Glide}
                  size={LoadingIconSizes.large}
                  show={true}
                  text="Loading Hypo Scenarios..."
                  full
                />
              );
            }
            return <ViewsWrapper notification={notification}>{HypoViews[activeViewKey]()}</ViewsWrapper>;
          }}
        />
      </>
    </LayoutsProvider>
  );
};

const mapStateToProps = (state: RootState): ReduxProps => ({
  hypoScenarios: HypoScenarios.selector(state),
  isLoadingHypoScenarios: HypoScenarios.pending(state),
  isResolvingAnAction: Action.pending(state),
  actionResult: Action.selector(state),
});

const mapDispatchToProps = (dispatch: any): ReduxDispatch => ({
  getHypoScenariosAction: () => dispatch(requestAsync(HypoScenarios.get())),
  deleteScenarioAction: (scenarioUri: string) => dispatch(requestAsync(Scenario.remove(scenarioUri))),
});

const HyposPage = (reduxProps: Props) => (
  <AuthContext.Consumer>{(actionAuth: any) => <Hypos actionAuth={actionAuth} {...reduxProps} />}</AuthContext.Consumer>
);

export default connect(mapStateToProps, mapDispatchToProps)(HyposPage);
