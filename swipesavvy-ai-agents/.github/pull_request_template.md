# Pull Request Template

## Description

<!-- Provide a brief description of the changes in this PR -->

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring
- [ ] Test addition/modification

## Related Issue

<!-- Link to the issue this PR addresses -->
Closes #

## Changes Made

<!-- List the specific changes made in this PR -->

- 
- 
- 

## Testing

<!-- Describe the testing you've done -->

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Evaluation on gold set passed
- [ ] Manual testing completed
- [ ] All tests passing locally

### Test Results

```
# Paste test output here
```

## Evaluation Results

<!-- If this affects agent behavior, paste evaluation results -->

- [ ] Evaluated on gold set
- [ ] Accuracy >= 85%
- [ ] No increase in hallucination rate
- [ ] Response time within target (<2s p95)

## Code Quality Checklist

- [ ] Code follows style guidelines (Black, Flake8)
- [ ] Self-review completed
- [ ] Code is commented, particularly in hard-to-understand areas
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Added tests that prove the fix is effective or feature works
- [ ] New and existing unit tests pass locally

## Security Checklist

- [ ] No secrets or API keys committed
- [ ] No PII exposed in logs or responses
- [ ] Input validation added where needed
- [ ] Guardrails tested and working
- [ ] Security review completed (if applicable)

## Deployment Notes

<!-- Any special considerations for deployment -->

- [ ] Database migrations needed (run `python scripts/migrate.py`)
- [ ] Environment variables added/updated (update `.env.example`)
- [ ] Feature flag required
- [ ] Rollback plan documented

## Screenshots (if applicable)

<!-- Add screenshots to help explain your changes -->

## Additional Context

<!-- Add any other context about the PR here -->

## Reviewer Notes

<!-- Notes for reviewers -->

- [ ] Architecture review needed
- [ ] Design review needed
- [ ] Security review needed
- [ ] Performance testing needed

---

## For Reviewers

Please verify:
- [ ] Code quality and style
- [ ] Test coverage adequate
- [ ] Documentation complete
- [ ] No security issues
- [ ] Performance acceptable
- [ ] Meets requirements

## Approval

This PR is ready to merge when:
- [ ] At least 1 approval received
- [ ] All CI checks passing
- [ ] All conversations resolved
- [ ] Tech Lead approval (if architecture change)
