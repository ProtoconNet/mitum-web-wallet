import React, { createRef } from 'react';
import Sleep from '../lib/Sleep';
import './Help.scss';

import pdfFile from '../mitum_wallet_manual.pdf';
import { pdfjs, Document, Page } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

class Help extends React.Component {

    constructor(props) {
        super(props);

        this.pdfRef = createRef();

        this.state = {
            isShowExp: false,

            numPages: null,
            pageNumber: 1,
        }
    }

    onDocumentLoadSuccess({ numPages }) {
        this.setState({ numPages });
    }

    goToPrevPage = () =>
        this.setState(state => ({ pageNumber: state.pageNumber - 1 }));
    goToNextPage = () =>
        this.setState(state => ({ pageNumber: state.pageNumber + 1 }));


    async componentDidMount() {

        await Sleep(2000);
        this.setState({
            isShowExp: true,
        });
        this.scrollToPdf();
    }

    scrollToPdf = () => {
        if (this.pdfRef.current && this.state.isShowExp) {
            this.pdfRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }

    componentDidUpdate() {
        this.scrollToPdf();
    }

    render() {
        const { pageNumber, numPages } = this.state;

        return (
            <div className="help-container">
                <div id='help-start' style={{
                    display: this.state.isShowExp ? 'none' : 'flex'
                }}>
                    <h1>Wait...</h1>
                </div>

                <div ref={this.pdfRef} />
                <div id='help-document' style={{
                    display: this.state.isShowExp ? 'flex' : 'none'
                }}>
                    <a id='link' target="_blank" download='manual.pdf'
                        href={pdfFile} rel="noreferrer">
                        DOWNLOAD MANUAL
                    </a>
                    <Document
                        file={pdfFile}
                        onLoadSuccess={({ numPages }) => this.onDocumentLoadSuccess({ numPages })}>
                        <Page pageNumber={pageNumber} />
                    </Document>

                    <p id='switch'>
                        <span id='left' onClick={() => this.state.pageNumber > 1 ?
                            this.setState({
                                numPages: this.state.numPages,
                                pageNumber: this.state.pageNumber - 1
                            }) : null}>
                            &lt;
                        </span>
                        <span>{pageNumber} / {numPages}</span>
                        <span id='right' onClick={() => this.state.pageNumber < numPages ?
                            this.setState({
                                numPages: this.state.numPages,
                                pageNumber: this.state.pageNumber + 1
                            }) : null}>
                            &gt;
                        </span>
                    </p>
                    <p>가이드의 내용이 잘 보이지 않는 경우 상단의 DOWNLOAD MANUAL을 통해 파일을 직접 다운로드 하여 주시기 바랍니다.</p>
                </div>
            </div>
        );
    }
}

export default Help;