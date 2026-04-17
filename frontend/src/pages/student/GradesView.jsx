import React from 'react';
import MockModulePage from '../../components/common/MockModulePage';
import { modulePageMockData } from '../../services/mock/modulePagesMockData';

const GradesView = () => <MockModulePage {...modulePageMockData.gradesView} />;

export default GradesView;
