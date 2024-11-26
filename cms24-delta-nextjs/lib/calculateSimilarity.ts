const calculateSimilarityGuess = (a: string, b: string): number => {
    const levenshtein = (s1: string, s2: string): number => {
        const len1 = s1.length;
        const len2 = s2.length;
        const dp = Array.from({ length: len1 + 1 }, () => Array(len2 + 1).fill(0));

        for (let i = 0; i <= len1; i++) dp[i][0] = i;
        for (let j = 0; j <= len2; j++) dp[0][j] = j;

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (s1[i - 1] === s2[j - 1]) {
                    dp[i][j] = dp[i - 1][j - 1];
                } else {
                    dp[i][j] = Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]) + 1;
                }
            }
        }

        return dp[len1][len2];
    };

    const distance = levenshtein(a, b);
    const maxLength = Math.max(a.length, b.length);
    return ((maxLength - distance) / maxLength) * 100; // Similarity percentage
};
