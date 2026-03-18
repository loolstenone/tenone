export type GoalLevel = 'GPR-I' | 'GPR-II' | 'GPR-III';
export type GoalStatus = 'Draft' | 'Pending Approval' | 'Agreed' | 'In Progress' | 'Self Evaluated' | 'Evaluated' | 'Completed';
export type EvaluationRating = 1 | 2 | 3 | 4 | 5;

export interface GprGoal {
    id: string;
    staffId: string;
    level: GoalLevel;
    title: string;
    description: string;
    kpi: string;
    weight: number;
    status: GoalStatus;
    progress: number;
    dueDate?: string;
    // 합의
    agreedBy?: string;
    agreedAt?: string;
    // 자기 평가
    selfRating?: EvaluationRating;
    selfComment?: string;
    selfEvaluatedAt?: string;
    // 상사 평가
    supervisorRating?: EvaluationRating;
    supervisorComment?: string;
    supervisorId?: string;
    evaluatedAt?: string;
    // 메타
    period: string;
    createdAt: string;
    updatedAt: string;
}
