import React, { useState, useEffect, useContext } from 'react';
import styles from '../TestMenu/TestMenu.module.scss';
import { GlobalContext } from '../../context/reducers/globalReducer';
import { openBrowserDocs } from '../../context/actions/globalActions';
import { addDescribeBlock, createNewTest } from '../../context/actions/reactTestCaseActions';
import Modal from '../Modals/Modal';
import useGenerateTest from '../../context/useGenerateTest.jsx';
import { MockDataContext } from '../../context/reducers/mockDataReducer';
import {
  updateFile,
  setFilePath,
  toggleRightPanel,
  setValidCode,
  setTestCase,
  toggleModal,
  toggleExportBool,
  setTabIndex,
} from '../../context/actions/globalActions';
import { ReactTestCaseContext } from '../../context/reducers/reactTestCaseReducer';
import { useToggleModal, validateInputs } from './testMenuHooks';
import ExportFileModal from '../Modals/ExportFileModal';
const { ipcRenderer } = require('electron');
// import UploadTest from '../UploadTest/UploadTest';
// import GetTests from '../GetTests/GetTests';

const ReactTestMenu = () => {
  // React testing docs url
  const reactUrl = 'https://testing-library.com/docs/react-testing-library/example-intro';

  // const [isModalOpen, setIsModalOpen] = useState(false);
  const { title, isModalOpen, openModal, openScriptModal, closeModal } = useToggleModal('react');
  const [{ mockData }, dispatchToMockData] = useContext(MockDataContext);
  const [reactTestCase, dispatchToReactTestCase] = useContext(ReactTestCaseContext);
  const [{ projectFilePath, file, exportBool, isTestModalOpen, fileName }, dispatchToGlobal] =
    useContext(GlobalContext);
  const generateTest = useGenerateTest('react', projectFilePath);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [userSavedTest, setUserSavedTest] = useState(false)

  useEffect(() => {
    dispatchToGlobal(setValidCode(true));
  }, []);

  const handleAddDescribeBlock = (e) => {
    dispatchToReactTestCase(addDescribeBlock());
  };

  const openDocs = () => {
    dispatchToGlobal(openBrowserDocs(reactUrl));
  };

  const fileHandle = () => {
    const testGeneration = generateTest(reactTestCase, mockData);
    dispatchToGlobal(updateFile(testGeneration));
    dispatchToGlobal(toggleRightPanel('codeEditorView'));
    dispatchToGlobal(setFilePath(''));
    dispatchToGlobal(setTabIndex(0));
    return testGeneration;
  };

// functionality when user clicks Save Test button
const saveTest = () => {
  const valid = validateInputs('react', reactTestCase);
  dispatchToGlobal(setValidCode(valid));

  
  const newFilePath = `${projectFilePath}/__tests__/${fileName}`; 
  const updatedData = fileHandle();

  // check to see if user has saved test before. If not, then open ExportFileModal
  if(!newFilePath.includes('test.js') || !userSavedTest){
    dispatchToGlobal(toggleExportBool())
    setIsExportModalOpen(true)
    setUserSavedTest(true)
  }


  // if user already has a saved test file, rewrite the file with the updated data
  if(newFilePath.includes('test.js') && userSavedTest){
    ipcRenderer.sendSync('ExportFileModal.fileCreate', newFilePath, updatedData)
  }
}

  const openNewTestModal = () => {
    if (!isTestModalOpen) dispatchToGlobal(toggleModal());
  };

  if (!file && exportBool) dispatchToGlobal(updateFile(generateTest(reactTestCase, mockData)));

  return (
    <div id='test'>
      <div id={styles.testMenu}>
        <div id={styles.left}>
          <button onClick={openModal} autoFocus>
            New Test +
          </button>
          <button onClick={fileHandle}>Preview</button>
          <button id={styles.example} onClick={openScriptModal}>
            Run Test
          </button>
          <button id={styles.example} onClick={openDocs}>
            Need Help?
          </button>
          {/* <UploadTest testType='react' />
          <GetTests testType='react' /> */}
          <Modal
            title={title}
            isModalOpen={isModalOpen}
            closeModal={closeModal}
            dispatchMockData={dispatchToMockData}
            dispatchTestCase={dispatchToReactTestCase}
            createTest={createNewTest}
          />
          {/* Just send user to docs on button click */}
        </div>

        <div
          id={styles.right}
          style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button data-testid='addDescribeButton' onClick={handleAddDescribeBlock}>
            +Describe Block
          </button>
          <button id={styles.rightBtn} onClick={saveTest}>
            Save Test
          </button>
        </div>
        <ExportFileModal
          isExportModalOpen={isExportModalOpen}
          setIsExportModalOpen={setIsExportModalOpen}
        />
      </div>
    </div>
  );
};

export default ReactTestMenu;
